import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import timeEntryRoutes from './routes/timeEntries';
import { errorHandler, notFound } from './middleware/errorHandler';
import connectDB from './config/database';
import swaggerOptions from './config/swagger';

// Load environment variables
dotenv.config({ path: '.env' });

// Environment variables loaded successfully

const app = express();

// Connect to MongoDB after environment variables are loaded
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger documentation setup
const specs = swaggerJsdoc(swaggerOptions);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: |
 *       Check the health and status of the Timesheet Service.
 *       Returns basic information about the service including:
 *       - Service status
 *       - Current timestamp
 *       - Environment information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Timesheet Service is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Current server timestamp
 *                   example: "2024-01-01T12:00:00.000Z"
 *                 environment:
 *                   type: string
 *                   description: Current environment (development, production, etc.)
 *                   example: "development"
 *             example:
 *               success: true
 *               message: "Timesheet Service is running"
 *               timestamp: "2024-01-01T12:00:00.000Z"
 *               environment: "development"
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Timesheet Service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Timesheet Service API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));

// API routes
app.use('/api/time-entries', timeEntryRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

export default app;
