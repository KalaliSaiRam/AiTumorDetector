const express = require('express');
const { body } = require('express-validator');
const {
  createPatient,
  getPatients,
  getPatientById,
} = require('../controllers/patient.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// All patient routes require authentication
router.use(authenticate);

const patientValidation = [
  body('name').trim().notEmpty().withMessage('Patient name is required.'),
  body('age')
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be a number between 0 and 150.'),
  body('gender')
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('Gender must be MALE, FEMALE, or OTHER.'),
  body('contact').trim().notEmpty().withMessage('Contact is required.'),
];

// POST /api/patients — DOCTOR or RECEPTIONIST
router.post(
  '/',
  requireRole('DOCTOR', 'RECEPTIONIST', 'ADMIN'),
  patientValidation,
  createPatient
);

// GET /api/patients — all authenticated users
router.get('/', getPatients);

// GET /api/patients/:id — all authenticated users
router.get('/:id', getPatientById);

module.exports = router;
