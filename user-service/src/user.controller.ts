import {
  asyncHandler,
  StatusCodes,
  createSuccessResponse,
  createServiceError,
} from '@zapurl/shared';
import { UserService } from './user.service';

const userService = new UserService();

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    throw createServiceError('User ID is required', StatusCodes.UNAUTHORIZED);
  }

  const user = await userService.getUserProfile(userId);

  res.status(StatusCodes.OK).json(
    createSuccessResponse(
      {
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
      'User profile fetched successfully'
    )
  );
});
