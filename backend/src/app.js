require('dotenv').config();
require('./config/config'); // validate env vars early

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiResponse = require('./utils/apiResponse');

// ─── Route Imports ─────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const scanRoutes = require('./routes/scan.routes');
const doctorRoutes = require('./routes/doctor.routes');
const adminRoutes = require('./routes/admin.routes');
const appointmentRoutes = require('./routes/appointment.routes');

const app = express();

// ─── Global Middleware ─────────────────────────────────────

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health Check & Root ───────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json(apiResponse.success({}, 'MRI Detection Backend is running perfectly.'));
});

app.get('/health', (req, res) => {
  res.status(200).json(
    apiResponse.success(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'MRI Detection Backend',
        version: '1.0.0',
      },
      'Service is healthy.'
    )
  );
});

// ─── API Routes ────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);

// ─── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json(apiResponse.error(`Route ${req.method} ${req.path} not found.`));
});

// ─── Global Error Handler ──────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err);

  // Prisma known errors
  if (err.code === 'P2002') {
    return res
      .status(409)
      .json(apiResponse.error('Duplicate entry: a record with this data already exists.'));
  }
  if (err.code === 'P2025') {
    return res.status(404).json(apiResponse.error('Record not found.'));
  }

  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message;

  return res.status(statusCode).json(apiResponse.error(message));
});

module.exports = app;
