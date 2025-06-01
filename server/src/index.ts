import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { errorHandler, notFound } from './middleware/errorHandler';
import { CategoryService } from './services/categoryService';

// Import routes
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import categoryRoutes from './routes/categories';
import userRoutes from './routes/user';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // Replace with actual domain
    : ['http://localhost:3000', 'http://localhost:19006'], // Expo dev server
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/user', userRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Initialize categories on startup
async function initializeApp() {
  try {
    const categoryService = new CategoryService();
    await categoryService.initializeCategories();
    console.log('✅ Categories initialized');
  } catch (error) {
    console.error('❌ Failed to initialize categories:', error);
  }
}

// Start server
const PORT = config.port;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`);
  await initializeApp();
});

export default app;
