import { Date, Document, ObjectId } from 'mongoose';

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

/**
 * Session interface
 *
 * @interface ISession
 * @extends {Document}
 * @property {ObjectId} userId - User ID
 * @property {boolean} valid - Session validity
 * @property {string} userAgent - User agent
 * @property {string} ip - User IP address
 * @property {string} token - Session token
 * @property {Date} createdAt - Session creation date
 * @property {Date} updatedAt - Session update date
 */
export interface ISession extends Document {
  userId: ObjectId;
  valid: boolean;
  userAgent: string;
  ip: string;
  token?: string;
  createdAt: Date;
  updatedAt: Date;
}
