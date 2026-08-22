import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';

try {
  await connectDatabase();
  const server = app.listen(env.port, () => {
    console.log(`My Personal OS API listening on port ${env.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received; closing server.`);
    server.close();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
} catch (error) {
  console.error('Unable to start API:', error.message);
  process.exit(1);
}

