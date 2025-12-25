// Shared Types

export interface User {
  id: string;
  name: string;
  picturePic: string;
}

/**
 * User interface
 *
 * @interface IUser
 * @extends {Document}
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {string} profilePic - User profile picture
 * @property {'user' | 'admin'} role - User role
 * @property {boolean} isEmailVerified - User email verification status
 * @property {Date} createdAt - User creation date
 * @property {Date} updatedAt - User update date
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  profilePic?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  sessionId: string;
  iat: number; // issued at
  exp: number; // expiration time
}

export class ServiceError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function logError(error: Error, context?: Record<string, any>): void {
  console.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
}
