import dotenv from 'dotenv';

dotenv.config();

const requiredInProduction = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
if (process.env.NODE_ENV === 'production') {
  const missing = requiredInProduction.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/my-personal-os',
  jwtSecret: process.env.JWT_SECRET || 'local-development-secret-change-me',
  appAccessPassword: process.env.APP_ACCESS_PASSWORD || '1810@',
  webauthnRpId: process.env.WEBAUTHN_RP_ID || undefined,
  clientUrls: (process.env.CLIENT_URL || [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://localhost:4174',
    'http://127.0.0.1:4174',
  ].join(','))
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
};
