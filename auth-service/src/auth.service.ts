import {
  _1H_IN_MILLISECONDS,
  _7D_IN_MILLISECONDS,
  AuthTokens,
  createServiceError,
  JWTPayload,
  ServiceError,
  StatusCodes,
} from '@zapurl/shared';
import { User } from './user.model';
import { compareHashValue, hashValue } from './hash.util';
import { Session } from './session.model';
import { Types } from '@zapurl/shared';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

export class AuthService {
  private readonly JWT_ACCESS_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly JWT_ACCESS_EXPIRATION: number;
  private readonly JWT_REFRESH_EXPIRATION: number;
  private readonly googleClient: OAuth2Client;

  constructor() {
    this.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
    this.JWT_ACCESS_EXPIRATION = _1H_IN_MILLISECONDS;
    this.JWT_REFRESH_EXPIRATION = _7D_IN_MILLISECONDS;

    if (!this.JWT_ACCESS_SECRET || !this.JWT_REFRESH_SECRET) {
      throw new Error('JWT secrets are not defined in environmental variables');
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error(
        'GOOGLE_CLIENT_ID is not defined in environmental variables'
      );
    }

    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  public async register(
    name: string,
    email: string,
    password: string,
    userAgent: string,
    ip: string
  ): Promise<AuthTokens> {
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw createServiceError('User already exists', StatusCodes.CONFLICT);
    }

    const hashedPassword = await hashValue(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: await this.getRole(email),
      isEmailVerified: false,
    });
    return this.createAuthSession(user._id as Types.ObjectId, userAgent, ip);
  }

  public async login(
    email: string,
    password: string,
    userAgent: string,
    ip: string
  ): Promise<AuthTokens> {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      throw createServiceError('Invalid Credentials', StatusCodes.UNAUTHORIZED);
    }

    const isMatch = await compareHashValue(password, user.password);
    if (!isMatch) {
      throw createServiceError('Invalid Credentials', StatusCodes.UNAUTHORIZED);
    }

    return this.createAuthSession(user._id as Types.ObjectId, userAgent, ip);
  }

  public async googleAuth(
    credential: string,
    userAgent: string,
    ip: string
  ): Promise<AuthTokens> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload?.email)
        throw createServiceError(
          'Invalid Google Token',
          StatusCodes.UNAUTHORIZED
        );

      const { name, email, picture, email_verified } = payload;
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          name: name || 'User',
          email,
          profilePic: picture,
          role: await this.getRole(email),
          isEmailVerified: email_verified,
        });
      }

      return this.createAuthSession(user._id as Types.ObjectId, userAgent, ip);
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw createServiceError(
        'Google Authentication Failed',
        StatusCodes.UNAUTHORIZED
      );
    }
  }

  public async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JWTPayload;
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET);
      if (typeof decoded === 'string') {
        throw new Error();
      }
      payload = decoded as JWTPayload;
    } catch {
      throw createServiceError(
        'Invalid or Expired Refresh Token',
        StatusCodes.UNAUTHORIZED
      );
    }

    const session = await Session.findById(payload.sessionId);
    if (!session || !session.valid || !session.token) {
      throw createServiceError('Session invalid', StatusCodes.UNAUTHORIZED);
    }

    // Security: Verify the token matches the hash in DB
    const isTokenMatch = await compareHashValue(refreshToken, session.token);
    if (!isTokenMatch) {
      await Session.findByIdAndUpdate(session._id, { valid: false });
      throw createServiceError(
        'Invalid Refresh Token: Reuse detected',
        StatusCodes.UNAUTHORIZED
      );
    }

    // Generate new Access Token
    const accessToken = this.signJWT(
      { userId: payload.userId, sessionId: payload.sessionId },
      this.JWT_ACCESS_SECRET,
      this.JWT_ACCESS_EXPIRATION
    );

    let newRefreshToken = refreshToken;

    // Token Rotation: Only issue new refresh token if half life is over
    if (this.isTokenHalfExpired(payload.exp, payload.iat)) {
      newRefreshToken = this.signJWT(
        { userId: payload.userId, sessionId: payload.sessionId },
        this.JWT_REFRESH_SECRET,
        this.JWT_REFRESH_EXPIRATION
      );

      const hashedNewToken = await hashValue(newRefreshToken);
      session.token = hashedNewToken;
      await session.save();
    }

    return { accessToken, refreshToken: newRefreshToken };
  }

  public async logout(sessionId: string): Promise<void> {
    await Session.findByIdAndUpdate(sessionId, { valid: false });
  }

  private async getRole(email: string): Promise<string> {
    const allowedEmails = process.env.ALLOW_EMAILS?.split(',') || [];
    return allowedEmails.includes(email) ? 'admin' : 'user';
  }

  private async createAuthSession(
    userId: Types.ObjectId,
    userAgent: string,
    ip: string
  ): Promise<AuthTokens> {
    const session = await Session.create({
      userId: userId as any,
      userAgent,
      ip,
      valid: true,
    });

    const accessToken = this.signJWT(
      { userId: userId.toString(), sessionId: session._id.toString() },
      this.JWT_ACCESS_SECRET,
      this.JWT_ACCESS_EXPIRATION
    );

    const refreshToken = this.signJWT(
      { userId: userId.toString(), sessionId: session._id.toString() },
      this.JWT_REFRESH_SECRET,
      this.JWT_REFRESH_EXPIRATION
    );

    // Hash refresh token before saving
    session.token = await hashValue(refreshToken);
    await session.save();

    return { accessToken, refreshToken };
  }

  private signJWT(
    payload: Omit<JWTPayload, 'iat' | 'exp'>,
    secret: string,
    expiresInMs: number
  ): string {
    return jwt.sign(payload, secret, {
      expiresIn: Math.floor(expiresInMs / 1000),
    });
  }

  private isTokenHalfExpired(exp: number, iat: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    return now - iat >= (exp - iat) / 2;
  }
}
