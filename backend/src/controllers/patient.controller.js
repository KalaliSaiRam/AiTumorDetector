const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const prisma = new PrismaClient();

/**
 * POST /api/patients
 * Body: { name, age, gender, contact }
 */
const createPatient = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(apiResponse.error('Validation failed', errors.array()));
  }

  const { name, age, gender, contact } = req.body;

  const patient = await prisma.patient.create({
    data: {
      name,
      age: parseInt(age),
      gender,
      contact,
      createdById: req.body.doctorId || req.user.id,
    },
  });

  return res.status(201).json(apiResponse.success(patient, 'Patient created successfully.'));
});

/**
 * GET /api/patients
 * Query: ?page=1&limit=10&search=John
 */
const getPatients = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const search = req.query.search || '';
  const skip = (page - 1) * limit;

  const baseWhere = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { contact: { contains: search } },
        ],
      }
    : {};

  const roleWhere = req.user.role === 'DOCTOR' ? { createdById: req.user.id } : {};

  const where = { ...baseWhere, ...roleWhere };

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        _count: { select: { scans: true, reports: true } },
      },
    }),
    prisma.patient.count({ where }),
  ]);

  return res.status(200).json(
    apiResponse.success(
      {
        patients,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Patients retrieved successfully.'
    )
  );
});

/**
 * GET /api/patients/:id
 */
const getPatientById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, role: true } },
      scans: {
        orderBy: { uploadedAt: 'desc' },
        include: { prediction: true },
      },
      reports: {
        orderBy: { createdAt: 'desc' },
        include: { doctor: { select: { id: true, name: true } } },
      },
      appointments: {
        orderBy: { date: 'desc' },
        include: { doctor: { select: { id: true, name: true } } },
      },
    },
  });

  if (!patient) {
    return res.status(404).json(apiResponse.error('Patient not found.'));
  }

  if (req.user.role === 'DOCTOR' && patient.createdById !== req.user.id) {
    return res.status(403).json(apiResponse.error('Access denied. This patient is restricted to their assigned specialist.'));
  }

  return res.status(200).json(apiResponse.success(patient));
});

module.exports = { createPatient, getPatients, getPatientById };
