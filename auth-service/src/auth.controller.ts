import {
  _7D_IN_MILLISECONDS,
  asyncHandler,
  createSuccessResponse,
  StatusCodes,
} from '@zapurl/shared';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: _7D_IN_MILLISECONDS,
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ip = req.ip || 'Unknown';

  const { accessToken, refreshToken } = await authService.register(
    name,
    email,
    password,
    userAgent,
    ip
  );

  setRefreshCookie(res, refreshToken);

  res
    .status(StatusCodes.CREATED)
    .json(
      createSuccessResponse({ accessToken }, 'User registered successfully')
    );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ip = req.ip || 'Unknown';

  const { accessToken, refreshToken } = await authService.login(
    email,
    password,
    userAgent,
    ip
  );

  setRefreshCookie(res, refreshToken);

  res
    .status(StatusCodes.OK)
    .json(
      createSuccessResponse({ accessToken }, 'User logged in successfully')
    );
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { credential } = req.body;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const ip = req.ip || 'Unknown';

  const { accessToken, refreshToken } = await authService.googleAuth(
    credential,
    userAgent,
    ip
  );

  setRefreshCookie(res, refreshToken);

  res
    .status(StatusCodes.OK)
    .json(
      createSuccessResponse({ accessToken }, 'User logged in successfully')
    );
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(StatusCodes.NO_CONTENT).send();
    return;
  }

  const { accessToken, refreshToken } = await authService.refresh(token);

  setRefreshCookie(res, refreshToken);
  res
    .status(StatusCodes.OK)
    .json(createSuccessResponse({ accessToken }, 'Token refreshed'));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.sessionId;
  if (!sessionId) {
    res.status(StatusCodes.NO_CONTENT).send();
    return;
  }
  await authService.logout(sessionId);
  res.clearCookie('refreshToken');
  res.status(StatusCodes.NO_CONTENT).send();
});
