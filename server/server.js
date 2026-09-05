require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

require('./models/User');
require('./models/Department');
require('./models/Employee');
require('./models/Contract');
require('./models/WorkingSchedule');
require('./models/Attendance');
require('./models/TimeOffType');
require('./models/TimeOffAllocation');
require('./models/TimeOffRequest');
require('./models/SalaryStructure');
require('./models/SalaryRule');
require('./models/Payrun');
require('./models/Payslip');
require('./models/PayrollAudit');

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  }
});

app.use('/api/auth/login', loginLimiter);

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to PeoplePay360 API — Intelligent HR & Payroll Platform',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me (auth required)',
      users: 'GET /api/users (admin only)',
      myProfile: 'PUT /api/users/me/profile (any role)',
      changePassword: 'PUT /api/users/me/change-password (any role)'
    },
    docs: 'Visit http://localhost:5173 to log in to the frontend.',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (_req, res) => {
  const state = mongoose.connection.readyState;
  const mongoStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }[state] || 'unknown';
  res.status(200).json({
    success: true,
    message: 'PeoplePay360 API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: mongoStatus,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT);

    server.once('listening', () => {
      console.log('');
      console.log('  ╔════════════════════════════════════════════════════╗');
      console.log('  ║  PeoplePay360 — HR & Payroll API Server           ║');
      console.log(`  ║  Environment : ${String(process.env.NODE_ENV || 'development').padEnd(32)}║`);
      console.log(`  ║  Local URL   : http://localhost:${String(PORT).padEnd(21)}║`);
      console.log(`  ║  Health      : http://localhost:${PORT}/api/health${' '.repeat(10)}║`);
      console.log(`  ║  Frontend    : ${String(process.env.CLIENT_URL || 'http://localhost:5173').padEnd(32)}║`);
      console.log(`  ║  Database    : ${String(mongoose.connection.name || 'connected').padEnd(32)}║`);
      console.log('  ╚════════════════════════════════════════════════════╝');
      console.log('');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error('');
        console.error(`❌  Port ${PORT} is already in use.`);
        console.error('   Close the other process running on this port, or change PORT in server/.env');
        console.error('   Windows hint:  netstat -ano | findstr :' + PORT + '  → then taskkill /PID <pid> /F');
        console.error('');
      } else {
        console.error('❌  Server error:', err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌  Failed to start server:', error.message);
    if (error.name === 'MongooseError' || String(error.message).toLowerCase().includes('mongo')) {
      console.error('   → Check MONGO_URI in .env and verify MongoDB is reachable.');
    }
    process.exit(1);
  }
};

startServer();

module.exports = app;
