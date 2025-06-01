import dotenv from 'dotenv';
import path from 'path';

// Load environment file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // Firebase configuration
  firebase: {
    type: process.env.FIREBASE_TYPE || 'service_account',
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    tokenUri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
    authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
    clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universeDomain: process.env.FIREBASE_UNIVERSE_DOMAIN || 'googleapis.com',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  },
  
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '3145728'), // 3MB
  allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png').split(','),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
};
