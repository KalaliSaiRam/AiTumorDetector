const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config/config');

const prisma = new PrismaClient();

/**
 * Generate a signed JWT for a user
 */
const signToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * POST /api/auth/register
 * Body: { name, email, password, role? }
 */
const register = asyncHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(apiResponse.error('Validation failed', errors.array()));
  }

  const { name, email, password, role } = req.body;

  // Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json(apiResponse.error('Email is already registered.'));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user — ADMIN role users are auto-verified
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'DOCTOR',
      isVerified: role === 'ADMIN' ? true : false,
    },
    select: { id: true, name: true, email: true, role: true, isVerified: true },
  });

  const token = signToken(user);

  return res.status(201).json(
    apiResponse.success({ user, token }, 'Registration successful.')
  );
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(apiResponse.error('Validation failed', errors.array()));
  }

  const { email, password } = req.body;

  // Find user including password
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json(apiResponse.error('Invalid email or password.'));
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json(apiResponse.error('Invalid email or password.'));
  }

  const token = signToken(user);

  // Sanitise before sending
  const { password: _, ...safeUser } = user;

  return res.status(200).json(
    apiResponse.success({ user: safeUser, token }, 'Login successful.')
  );
});

/**
 * GET /api/auth/me
 * Returns currently authenticated user's profile
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true },
  });

  return res.status(200).json(apiResponse.success(user));
});

module.exports = { register, login, getMe };
