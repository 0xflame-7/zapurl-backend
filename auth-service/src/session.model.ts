import { ISession } from './auth.types';
import { Schema, model } from '@zapurl/shared';

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    valid: {
      type: Boolean,
      default: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    token: {
      type: String,
    },
  },
  { timestamps: true }
);

/**
 * @description Session model
 * @param {string} userId - User id
 * @param {string} valid - Session validity
 * @param {string} userAgent - User agent
 * @param {string} ip - User ip address
 * @param {string} token - Session token
 */
export const Session = model<ISession>('Session', sessionSchema);
