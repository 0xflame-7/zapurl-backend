import {
  asyncHandler,
  StatusCodes,
  createSuccessResponse,
  createServiceError,
} from '@zapurl/shared';
import { Request, Response } from 'express';
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

export const scanUrl = asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    throw createServiceError('URL is required', StatusCodes.BAD_REQUEST);
  }

  try {
    // Internal Docker DNS call (service-name:port)
    const pythonServiceUrl = 'http://scan-service:8000/analyze';

    const response = await fetch(pythonServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw createServiceError('Scan service failed', response.status);
    }

    const data = await response.json();

    res
      .status(StatusCodes.OK)
      .json(createSuccessResponse(data, 'Scan completed successfully'));
  } catch (error) {
    throw createServiceError(
      'Internal communication error',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});
