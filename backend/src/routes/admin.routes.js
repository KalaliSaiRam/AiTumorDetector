const express = require('express');
const { body } = require('express-validator');
const { getStats, toggleVerification, getUsers } = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// Apply authentication to all routes natively
router.use(authenticate);

// GET /api/admin/stats
router.get('/stats', requireRole('ADMIN'), getStats);

// GET /api/admin/users — with optional ?role=DOCTOR
// Allowed for ADMIN so they can manage staff, and RECEPTIONIST so they can fetch doctors for registration
router.get('/users', requireRole('ADMIN', 'RECEPTIONIST'), getUsers);

// POST /api/admin/toggle-verification
router.post(
  '/toggle-verification',
  requireRole('ADMIN'),
  [body('userId').notEmpty().withMessage('userId is required.')],
  toggleVerification
);

module.exports = router;
