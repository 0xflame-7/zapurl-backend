import http from 'http';
import { Application } from 'express';
import { connectDB, disconnectDB } from '../lib';

interface BootstrapOptions {
  app: Application;
  port: number;
  serviceName: string;
  mongoUrl: string;
  onStart?: () => void; // Optional callback after server starts
}

export const startService = async ({
  app,
  port,
  serviceName,
  mongoUrl,
  onStart,
}: BootstrapOptions) => {
  let server: http.Server;

  const shutdown = async (signal: string) => {
    console.log(
      `\n[${serviceName}] Received ${signal}. Starting graceful shutdown...`
    );

    try {
      // 1. Close HTTP Server
      if (server) {
        await new Promise<void>((resolve, reject) => {
          server.close((err) => {
            if (err) return reject(err);
            console.log(`[${serviceName}] HTTP Server closed.`);
            resolve();
          });
        });
      }

      // 2. Close Database Connection
      if (mongoUrl) {
        await disconnectDB(serviceName);
      }

      console.log(`[${serviceName}] Graceful shutdown complete. Exiting.`);
      process.exit(0);
    } catch (err) {
      console.error(`[${serviceName}] Error during graceful shutdown:`, err);
      process.exit(1);
    }
  };

  try {
    // 1. Connect to Database
    if (mongoUrl) {
      await connectDB(mongoUrl, serviceName);
    }

    // 2. Start Server
    server = app.listen(port, '0.0.0.0', () => {
      console.log(
        `[${serviceName}] Server started at http://localhost:${port}`
      );
      if (onStart) onStart();
    });

    // 3. Handle Signals
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.log(`[${serviceName}] Failed to start server`, error);
    process.exit(1);
  }
};
