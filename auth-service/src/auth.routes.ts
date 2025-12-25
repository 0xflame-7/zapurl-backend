import { validateRequest, authenticateSession } from '@zapurl/shared';
import { Router } from 'express';
import * as auth from './auth.controller';
import { loginSchema, registerSchema } from './auth.schema';

// Initialize router
const router: Router = Router();

// Public Routes
router.post('/register', validateRequest(registerSchema), auth.register);

router.post('/login', validateRequest(loginSchema), auth.login);

router.post('/refresh', auth.refresh);

router.post('/logout', authenticateSession, auth.logout);

export default router;
