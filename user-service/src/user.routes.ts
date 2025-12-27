import { authenticateSession } from '@zapurl/shared';
import { Router } from 'express';
import * as userController from './user.controller';

const router: Router = Router();

// Protected Route: Get Current User Profile
router.get('/me', authenticateSession, userController.getProfile);

router.post('/scan', authenticateSession, userController.scanUrl);

export default router;
