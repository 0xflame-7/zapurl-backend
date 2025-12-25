import express, { Application } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions, errorHandler } from '@zapurl/shared';
import authRoutes from './auth.routes';

// Initialize app
const app: Application = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions()));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy
app.set('trust proxy', 1);

// Routes
app.use('/auth', authRoutes);

// Error handler
app.use(errorHandler);

export default app;
