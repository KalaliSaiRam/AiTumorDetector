const express = require('express');
const { body } = require('express-validator');
const { uploadScan, predictScan, getScan } = require('../controllers/scan.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole, requireVerified } = require('../middleware/roleCheck');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// All scan routes require authentication
router.use(authenticate);

// POST /api/scans/upload — DOCTOR, RECEPTIONIST, ADMIN
router.post(
  '/upload',
  requireRole('DOCTOR', 'RECEPTIONIST', 'ADMIN'),
  upload.single('image'),
  handleMulterError,
  [body('patientId').notEmpty().withMessage('patientId is required.')],
  uploadScan
);

// POST /api/scans/:id/predict — DOCTOR only (must be verified)
router.post(
  '/:id/predict',
  requireRole('DOCTOR', 'ADMIN'),
  requireVerified,
  predictScan
);

// GET /api/scans/:id — all authenticated users
router.get('/:id', getScan);

module.exports = router;
