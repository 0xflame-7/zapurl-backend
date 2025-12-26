import app from './app';
import { parseEnvInt, print, startService } from '@zapurl/shared';

const PORT = parseEnvInt(process.env.PORT, 4001);
const SERVICE_NAME = 'User Service';
const MONGO_URL = process.env.MONGO_URL || '';

startService({
  app,
  port: PORT,
  serviceName: SERVICE_NAME,
  mongoUrl: MONGO_URL,
  onStart: () => print(),
});
