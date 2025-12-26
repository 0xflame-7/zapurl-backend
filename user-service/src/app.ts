import express, { Application } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions, errorHandler } from '@zapurl/shared';
import userRoutes from './user.routes';

// Initialize app
const app: Application = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions()));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/user', userRoutes);

// Error handler
app.use(errorHandler);

export default app;
