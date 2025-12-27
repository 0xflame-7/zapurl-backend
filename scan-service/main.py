import asyncio
import socket
import ssl
import whois
import httpx
import os
import json
from datetime import datetime
from urllib.parse import urlparse
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
app = FastAPI()
client = AsyncGroq(api_key=GROQ_API_KEY)

class ScanRequest(BaseModel):
    url: str


async def get_ip(hostname):
    try:
        # Run blocking socket call in a thread
        return await asyncio.to_thread(socket.gethostbyname, hostname)
    except:
        return None

async def get_whois(hostname):
    try:
        # Run blocking whois call in a thread with timeout
        w = await asyncio.to_thread(whois.whois, hostname)
        # Handle different response formats (some are lists, some strings)
        registrar = w.registrar[0] if isinstance(w.registrar, list) else w.registrar
        creation_date = w.creation_date[0] if isinstance(w.creation_date, list) else w.creation_date
        return {"registrar": str(registrar), "creation_date": str(creation_date)}
    except:
        return {"registrar": "Unknown", "creation_date": None}

async def get_ssl_status(hostname):
    try:
        ctx = ssl.create_default_context()
        # Wrap the socket handshake in a thread
        with socket.create_connection((hostname, 443), timeout=3) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                return {"valid": True, "issuer": dict(x[0] for x in cert['issuer'])['organizationName']}
    except:
        return {"valid": False, "issuer": None}

async def get_geoip(ip):
    if not ip: return "Unknown"
    async with httpx.AsyncClient() as http:
        try:
            resp = await http.get(f"http://ip-api.com/json/{ip}", timeout=3.0)
            data = resp.json()
            return f"{data.get('city')}, {data.get('countryCode')}"
        except:
            return "Unknown"


@app.post("/analyze")
async def analyze_url(request: ScanRequest):
    url = request.url
    try:
        parsed = urlparse(url if url.startswith("http") else f"http://{url}")
        hostname = parsed.netloc
    except:
        raise HTTPException(status_code=400, detail="Invalid URL")

    # 1. Parallel Data Gathering
    ip, whois_data, ssl_data = await asyncio.gather(
        get_ip(hostname),
        get_whois(hostname),
        get_ssl_status(hostname)
    )
    
    # GeoIP needs the IP first
    location = await get_geoip(ip)

    # Calculate Domain Age
    domain_age = "Unknown"
    if whois_data["creation_date"]:
        try:
            # Simple parsing logic - production needs robust date parsing
            c_date = datetime.strptime(str(whois_data["creation_date"]).split(" ")[0], "%Y-%m-%d")
            domain_age = (datetime.now() - c_date).days
        except:
            pass

    # 2. Construct Prompt
    system_prompt = f"""
    You are PhishGuard AI. Analyze this URL based on the technical truth below.
    
    Technical Truth:
    - URL: {url}
    - Hostname: {hostname}
    - IP: {ip} ({location})
    - Registrar: {whois_data['registrar']}
    - Age: {domain_age} days
    - SSL: {'Valid' if ssl_data['valid'] else 'Invalid'} (Issuer: {ssl_data['issuer']})

    Output STRICT JSON matching this schema:
    {{
        "threat_assessment": {{
            "level": "safe" | "suspicious" | "dangerous",
            "score": 0-100,
            "summary": "string"
        }},
        "risk_factors": [{{ "title": "string", "severity": "info"|"warning"|"critical" }}],
        "recommendations": [{{ "type": "block"|"report", "text": "string" }}]
    }}
    """

    # 3. Call Groq
    try:
        chat = await client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            response_format={"type": "json_object"} # Groq native JSON mode
        )
        return json.loads(chat.choices[0].message.content)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
