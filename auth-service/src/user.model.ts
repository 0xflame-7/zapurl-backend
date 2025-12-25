import { IUser, userSchema, model } from '@zapurl/shared';

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
