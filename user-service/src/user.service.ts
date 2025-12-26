import { createServiceError, StatusCodes, Types } from '@zapurl/shared';
import { User } from './user.model';

export class UserService {
  public async getUserProfile(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw createServiceError('Invalid user ID', StatusCodes.BAD_REQUEST);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw createServiceError('User not found', StatusCodes.NOT_FOUND);
    }

    return user;
  }
}
