import http from 'http';
import app from './app';
import { print } from '@zapurl/shared';
import { connectDB, disconnectDB } from './mongoose.lib';

const PORT = process.env.PORT || 4000;
const SERVICE_NAME = 'Auth Service';
const MONGO_URL = process.env.MONGO_URL || '';

let server: http.Server;

const startServer = async () => {
  try {
    await connectDB(MONGO_URL, SERVICE_NAME);

    server = app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server started at http://localhost:${PORT}`);
      print();
    });
  } catch (error) {
    console.log('Failed to start server', error);
    process.exit(1);
  }
};

// Graceful Shutdown Logic
const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  try {
    // 1. Close HTTP Server (stop accepting new requests)
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          console.log('HTTP Server closed.');
          resolve();
        });
      });
    }

    // 2. Close Database Connection
    await disconnectDB(SERVICE_NAME);

    console.log('Graceful shutdown complete. Exiting.');
    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
};

// Handle Signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start the app
startServer();
