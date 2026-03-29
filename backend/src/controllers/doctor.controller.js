const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const prisma = new PrismaClient();

/**
 * GET /api/doctor/patients
 * Returns patients who have reports associated with the logged-in doctor.
 * Also includes patients whose scans or appointments reference this doctor.
 */
const getMyPatients = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;

  // Patients linked via reports written by this doctor
  const patients = await prisma.patient.findMany({
    where: {
      OR: [
        { reports: { some: { doctorId } } },
        { appointments: { some: { doctorId } } },
        { createdById: doctorId },
      ],
    },
    include: {
      scans: {
        orderBy: { uploadedAt: 'desc' },
        take: 1,
        include: { prediction: true },
      },
      reports: {
        where: { doctorId },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      appointments: {
        where: { doctorId },
        orderBy: { date: 'desc' },
        take: 1,
      },
      _count: { select: { scans: true, reports: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.status(200).json(
    apiResponse.success({ patients, total: patients.length }, 'Patients retrieved.')
  );
});

/**
 * POST /api/doctor/diagnosis
 * Body: { patientId, diagnosis, aiSummary?, scanId? }
 * Creates or updates a Report for the patient.
 */
const createDiagnosis = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(apiResponse.error('Validation failed', errors.array()));
  }

  const { patientId, diagnosis, aiSummary } = req.body;
  const doctorId = req.user.id;

  // Verify patient exists
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) {
    return res.status(404).json(apiResponse.error('Patient not found.'));
  }

  const report = await prisma.report.create({
    data: {
      patientId,
      doctorId,
      diagnosis,
      aiSummary: aiSummary || null,
    },
    include: {
      patient: { select: { id: true, name: true, age: true } },
      doctor: { select: { id: true, name: true } },
    },
  });

  return res.status(201).json(apiResponse.success(report, 'Diagnosis report created.'));
});

/**
 * GET /api/doctor/reports
 * All reports written by this doctor
 */
const getMyReports = asyncHandler(async (req, res) => {
  const reports = await prisma.report.findMany({
    where: { doctorId: req.user.id },
    include: {
      patient: { select: { id: true, name: true, age: true, gender: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.status(200).json(apiResponse.success(reports));
});

/**
 * GET /api/doctor/dashboard
 * Aggregates tumor prediction statistics from all patients assigned to this doctor.
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;

  // Find all patients for this doctor
  const patients = await prisma.patient.findMany({
    where: {
      OR: [
        { reports: { some: { doctorId } } },
        { appointments: { some: { doctorId } } },
        { createdById: doctorId },
      ],
    },
    include: {
      scans: {
        orderBy: { uploadedAt: 'desc' },
        take: 1,
        include: { prediction: true },
      },
    },
  });

  let analyzed = 0, pituitary = 0, glioma = 0, meningioma = 0, clean = 0;

  patients.forEach((p) => {
    if (p.scans && p.scans.length > 0 && p.scans[0].prediction) {
      analyzed++;
      const type = p.scans[0].prediction.predictedClass.toLowerCase();
      if (type.includes('pituitary')) pituitary++;
      else if (type.includes('glioma')) glioma++;
      else if (type.includes('meningioma')) meningioma++;
      else clean++; // Catch-all for "notumor", "no_tumor", "normal"
    }
  });

  return res.status(200).json(
    apiResponse.success({
      total: patients.length,
      analyzed,
      distribution: { pituitary, glioma, meningioma, clean },
    }, 'Doctor analytics retrieved.')
  );
});

module.exports = { getMyPatients, createDiagnosis, getMyReports, getDashboardStats };
