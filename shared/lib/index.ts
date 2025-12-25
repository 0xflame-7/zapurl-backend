import mongoose, { connect, ConnectOptions, disconnect } from 'mongoose';
import { createServiceError } from '../utils';

const options: ConnectOptions = {
  sanitizeFilter: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
  dbName: 'zapurl',
};

export const connectDB = async (url: string, serviceName: string) => {
  try {
    if (!url) {
      throw createServiceError('Database URL is not defined', 500);
    }

    await connect(url, options);
    console.log(`Database connected successfully for ${serviceName}`);

    mongoose.connection.on('error', (error) => {
      console.log(`Database connection error for ${serviceName}:`, error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log(`Database disconnected for ${serviceName}`);
    });
  } catch (error) {
    console.log(`Database connection error for ${serviceName}:`, error);
    throw createServiceError(error as string, 500);
  }
};

export const disconnectDB = async (serviceName: string) => {
  try {
    await disconnect();
    console.log(`Database connection closed for ${serviceName}`);
  } catch (error) {
    console.log(`Database connection error for ${serviceName}:`, error);
    throw createServiceError(error as string, 500);
  }
};
