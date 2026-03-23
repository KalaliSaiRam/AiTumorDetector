const express = require('express');
const { body } = require('express-validator');
const { createAppointment, getDoctorAppointments } = require('../controllers/appointment.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(authenticate);

// Validation
const aptValidation = [
  body('patientId').notEmpty().withMessage('patientId is required.'),
  body('doctorId').notEmpty().withMessage('doctorId is required.'),
  body('date').isISO8601().withMessage('A valid date is required.')
];

// POST /api/appointments -> Roles: RECEPTIONIST, ADMIN
router.post(
  '/',
  requireRole('RECEPTIONIST', 'ADMIN'),
  aptValidation,
  createAppointment
);

// GET /api/appointments/doctor -> Roles: DOCTOR
router.get(
  '/doctor',
  requireRole('DOCTOR'),
  getDoctorAppointments
);

module.exports = router;
