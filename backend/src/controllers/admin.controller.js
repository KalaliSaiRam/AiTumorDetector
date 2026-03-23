const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const prisma = new PrismaClient();

/**
 * GET /api/admin/stats
 * Returns counts of users, patients, scans, predictions, reports
 */
const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalPatients,
    totalScans,
    totalPredictions,
    totalReports,
    totalAppointments,
    pendingDoctors,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.patient.count(),
    prisma.mRI_Scan.count(),
    prisma.prediction.count(),
    prisma.report.count(),
    prisma.appointment.count(),
    prisma.user.count({ where: { role: 'DOCTOR', isVerified: false } }),
  ]);

  // Breakdown by role
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: { role: true },
  });

  // Recent activity
  const recentScans = await prisma.mRI_Scan.findMany({
    take: 5,
    orderBy: { uploadedAt: 'desc' },
    include: {
      patient: { select: { id: true, name: true } },
      prediction: { select: { predictedClass: true, confidence: true } },
    },
  });

  return res.status(200).json(
    apiResponse.success({
      counts: {
        users: totalUsers,
        patients: totalPatients,
        scans: totalScans,
        predictions: totalPredictions,
        reports: totalReports,
        appointments: totalAppointments,
        pendingDoctorVerification: pendingDoctors,
      },
      usersByRole: usersByRole.map((r) => ({
        role: r.role,
        count: r._count.role,
      })),
      recentScans,
    })
  );
});

/**
 * POST /api/admin/toggle-verification
 * Body: { userId }
 * Toggles isVerified true/false for the specified user
 */
const toggleVerification = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(apiResponse.error('Validation failed', errors.array()));
  }

  const { userId } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return res.status(404).json(apiResponse.error('User not found.'));
  }

  if (user.role === 'ADMIN') {
    return res.status(400).json(apiResponse.error('System Administrators cannot be deactivated.'));
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isVerified: !user.isVerified },
    select: { id: true, name: true, email: true, role: true, isVerified: true },
  });

  const msg = updated.isVerified ? 'Staff account fully verified.' : 'Staff account deactivated.';
  return res.status(200).json(apiResponse.success(updated, msg));
});

/**
 * GET /api/admin/users
 * Returns all users with optional role filter
 */
const getUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;

  const where = role ? { role } : {};

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
      _count: { select: { patientsCreated: true, reports: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.status(200).json(apiResponse.success(users));
});

module.exports = { getStats, toggleVerification, getUsers };
