import { model, Schema } from 'mongoose';
import { IUser } from './auth.types';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    profilePic: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**
 * @description User model
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} profilePic - User profile picture
 * @param {string} role - User role
 * @param {boolean} isEmailVerified - User email verification status
 */
export const User = model<IUser>('User', userSchema);
