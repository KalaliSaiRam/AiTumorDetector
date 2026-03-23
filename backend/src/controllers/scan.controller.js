const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const apiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadBuffer, uploadBase64 } = require('../services/cloudinary.service');
const { callPredict } = require('../services/ai.service');

const prisma = new PrismaClient();

/**
 * POST /api/scans/upload
 * Form-data: image (file), patientId (string)
 *
 * Flow:
 *  1. Validate patient exists
 *  2. Upload image buffer → Cloudinary (folder: mri-scans)
 *  3. Save MRI_Scan record in DB
 *  4. Return scanId + imageUrl
 */
const uploadScan = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(apiResponse.error('Validation failed', errors.array()));
  }

  if (!req.file) {
    return res.status(400).json(apiResponse.error('MRI image file is required.'));
  }

  const { patientId } = req.body;

  // Verify patient exists
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) {
    return res.status(404).json(apiResponse.error('Patient not found.'));
  }

  // Upload to Cloudinary
  const imageUrl = await uploadBuffer(req.file.buffer, 'mri-scans');

  // Save scan record
  const scan = await prisma.mRI_Scan.create({
    data: {
      patientId,
      imageUrl,
    },
  });

  return res.status(201).json(
    apiResponse.success(
      { scanId: scan.id, imageUrl: scan.imageUrl, uploadedAt: scan.uploadedAt },
      'MRI scan uploaded successfully.'
    )
  );
});

/**
 * POST /api/scans/:id/predict
 *
 * Flow:
 *  1. Fetch scan (get imageUrl)
 *  2. Call FastAPI AI service with imageUrl
 *  3. Receive { predicted_class, confidence, top_predictions, heatmap (base64) }
 *  4. Upload heatmap base64 → Cloudinary (folder: mri-heatmaps)
 *  5. Save Prediction to DB (prevent duplicate)
 *  6. Return full result to frontend
 */
const predictScan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Fetch scan
  const scan = await prisma.mRI_Scan.findUnique({
    where: { id },
    include: { prediction: true, patient: true },
  });

  if (!scan) {
    return res.status(404).json(apiResponse.error('Scan not found.'));
  }

  // Return cached prediction if it already exists
  if (scan.prediction) {
    return res.status(200).json(
      apiResponse.success(
        {
          scan: {
            id: scan.id,
            imageUrl: scan.imageUrl,
            patientId: scan.patientId,
          },
          prediction: scan.prediction,
        },
        'Prediction already exists (cached).'
      )
    );
  }

  // Call AI service
  let aiResult;
  try {
    aiResult = await callPredict(scan.imageUrl);
  } catch (err) {
    const isTimeout = err.code === 'ECONNABORTED';
    const isDown = err.code === 'ECONNREFUSED';

    if (isDown) {
      return res
        .status(503)
        .json(apiResponse.error('AI service is unavailable. Please ensure the FastAPI server is running.'));
    }
    if (isTimeout) {
      return res
        .status(504)
        .json(apiResponse.error('AI service timed out. The image may be too large or the model is loading.'));
    }

    throw err; // bubble up unexpected errors
  }

  const { predicted_class, confidence, top_predictions, heatmap } = aiResult;

  // Upload heatmap base64 to Cloudinary
  const heatmapUrl = await uploadBase64(heatmap, 'mri-heatmaps');

  // Save prediction to DB
  const prediction = await prisma.prediction.create({
    data: {
      scanId: scan.id,
      predictedClass: predicted_class,
      confidence,
      heatmapUrl,
      topPredictions: top_predictions,
    },
  });

  return res.status(200).json(
    apiResponse.success(
      {
        scan: {
          id: scan.id,
          imageUrl: scan.imageUrl,
          patientId: scan.patientId,
          patient: { id: scan.patient.id, name: scan.patient.name },
        },
        prediction,
      },
      'Prediction complete.'
    )
  );
});

/**
 * GET /api/scans/:id
 * Returns scan with prediction (if any)
 */
const getScan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const scan = await prisma.mRI_Scan.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, name: true, age: true, gender: true } },
      prediction: true,
    },
  });

  if (!scan) {
    return res.status(404).json(apiResponse.error('Scan not found.'));
  }

  return res.status(200).json(apiResponse.success(scan));
});

module.exports = { uploadScan, predictScan, getScan };
