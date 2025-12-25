import { Date, Document, ObjectId } from 'mongoose';

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
