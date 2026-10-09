import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import planRoutes from './routes/planRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import companionRoutes from './routes/companionRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to support production frontend (Vercel), development, and preview deployments
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile, curl, Postman, health checks)
    if (!origin) return callback(null, true);

    // If CLIENT_URL is '*' or matches origin
    if (process.env.CLIENT_URL === '*' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow all Vercel deployments (*.vercel.app)
    if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }

    // Allow in non-production or if CLIENT_URL is not set
    if (process.env.NODE_ENV !== 'production' || !process.env.CLIENT_URL) {
      return callback(null, true);
    }

    // Permissive fallback so CORS never blocks legitimate app requests
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

// Middlewares
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Request logger for development
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/study-plans', planRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', companionRoutes);

// Root endpoint for deployment verification
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Campus — Remote Study Planner Backend REST API',
    status: 'online',
    health: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: '📚 Study Planner Backend REST API is running smoothly.',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start server & connect to Database.
// Connect to MongoDB Atlas first, then start listening on port 5000.
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Campus Study Planner backend running on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already occupied by another backend instance.`);
      } else {
        console.error('❌ Server startup error:', err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error(`❌ Database connection failed. Server not started.`);
    process.exit(1);
  }
};

startServer();
