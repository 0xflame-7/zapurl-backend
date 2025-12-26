import { authenticateSession } from '@zapurl/shared';
import { Router } from 'express';
import * as userController from './user.controller';

const router: Router = Router();

// Protected Route: Get Current User Profile
router.get('/me', authenticateSession, userController.getProfile);

export default router;
