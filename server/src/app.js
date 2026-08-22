import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import vaultRoutes from './routes/vaultRoutes.js';
import accessRoutes from './routes/accessRoutes.js';
import { requireAppGate } from './utils/appGate.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, '../../client/dist');
const clientBuildExists = fs.existsSync(path.join(clientDistPath, 'index.html'));

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.clientUrls.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many authentication attempts. Try again later.', code: 'RATE_LIMITED' } },
});

app.get('/api', (_req, res) => res.json({ success: true, data: { name: 'My Personal OS API', version: '0.1.0' } }));
app.use('/api/health', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/access', authLimiter, accessRoutes);
app.use('/api/dashboard', requireAppGate, dashboardRoutes);
app.use('/api/workspace', requireAppGate, workspaceRoutes);
app.use('/api/users', requireAppGate, userRoutes);
app.use('/api/analytics', requireAppGate, analyticsRoutes);
app.use('/api/vault', requireAppGate, vaultRoutes);

if (clientBuildExists) {
  app.use(express.static(clientDistPath));
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
