import httpx
import asyncio
import json

async def test_scan():
    url = "http://127.0.0.1:8000/analyze"
    payload = {"url": "example.com"}
    try:
        async with httpx.AsyncClient() as client:
            print(f"Sending request to {url} with {payload}...")
            response = await client.post(url, json=payload, timeout=30.0)
            print(f"Status Code: {response.status_code}")
            try:
                print("Response JSON:")
                print(json.dumps(response.json(), indent=2))
            except json.JSONDecodeError:
                print("Response Text:")
                print(response.text)
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(test_scan())
