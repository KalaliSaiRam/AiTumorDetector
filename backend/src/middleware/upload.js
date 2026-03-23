const multer = require('multer');
const path = require('path');
const apiResponse = require('../utils/apiResponse');

// Store files in memory (buffer) — we immediately stream to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/dicom'];
  const allowedExtensions = /\.(jpg|jpeg|png|webp|dcm)$/i;

  const isValidMime = allowedMimeTypes.includes(file.mimetype);
  const isValidExt = allowedExtensions.test(path.extname(file.originalname));

  if (isValidMime || isValidExt) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only JPEG, PNG, WebP, and DICOM files are allowed.'),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max
  },
});

/**
 * Multer error handler middleware
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(apiResponse.error('File too large. Max size is 20MB.'));
    }
    return res.status(400).json(apiResponse.error(`Upload error: ${err.message}`));
  }
  if (err) {
    return res.status(400).json(apiResponse.error(err.message));
  }
  next();
};

module.exports = { upload, handleMulterError };
