const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const prisma = new PrismaClient();

/**
 * POST /api/appointments
 * Body: { patientId, doctorId, date }
 */
const createAppointment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(apiResponse.error('Validation failed', errors.array()));
  }

  const { patientId, doctorId, date } = req.body;

  // Validate patient and doctor exist
  const [patient, doctor] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.user.findUnique({ where: { id: doctorId } }),
  ]);

  if (!patient || !doctor) {
    return res.status(404).json(apiResponse.error('Patient or Doctor not found.'));
  }

  if (doctor.role !== 'DOCTOR') {
    return res.status(400).json(apiResponse.error('Appointments can only be scheduled with DOCTOR accounts.'));
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      doctorId,
      date: new Date(date),
      status: 'SCHEDULED'
    },
  });

  return res.status(201).json(apiResponse.success(appointment, 'Appointment scheduled successfully.'));
});

/**
 * GET /api/appointments/doctor
 * Fetches appointments mapped to the logged in Doctor
 */
const getDoctorAppointments = asyncHandler(async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    where: { doctorId: req.user.id },
    orderBy: { date: 'asc' },
    include: { patient: { select: { id: true, name: true, gender: true, age: true, contact: true } } }
  });
  
  return res.status(200).json(apiResponse.success(appointments));
});

module.exports = { createAppointment, getDoctorAppointments };
