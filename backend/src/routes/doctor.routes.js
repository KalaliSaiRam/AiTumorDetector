const express = require('express');
const { body } = require('express-validator');
const { getMyPatients, createDiagnosis, getMyReports } = require('../controllers/doctor.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// All doctor routes: must be authenticated + DOCTOR role
router.use(authenticate, requireRole('DOCTOR', 'ADMIN'));

const diagnosisValidation = [
  body('patientId').notEmpty().withMessage('patientId is required.'),
  body('diagnosis').trim().notEmpty().withMessage('Diagnosis text is required.'),
  body('aiSummary').optional().isString(),
];

// GET /api/doctor/patients
router.get('/patients', getMyPatients);

// GET /api/doctor/reports
router.get('/reports', getMyReports);

// POST /api/doctor/diagnosis
router.post('/diagnosis', diagnosisValidation, createDiagnosis);

module.exports = router;
