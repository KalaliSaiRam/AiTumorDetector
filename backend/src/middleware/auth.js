const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const apiResponse = require('../utils/apiResponse');
const config = require('../config/config');

const prisma = new PrismaClient();

/**
 * Verifies JWT from Authorization: Bearer <token>
 * Attaches decoded user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json(apiResponse.error('Access denied. No token provided.'));
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      return res
        .status(401)
        .json(apiResponse.error('Invalid or expired token.'));
    }

    // Verify user still exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, isVerified: true },
    });

    if (!user) {
      return res.status(401).json(apiResponse.error('User no longer exists.'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticate };
