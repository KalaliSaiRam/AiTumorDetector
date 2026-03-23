const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

/**
 * Uploads a Buffer directly to Cloudinary.
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} Secure URL of uploaded image
 */
const uploadBuffer = (buffer, folder = 'mri-scans') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        quality: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    // Convert buffer to readable stream and pipe to Cloudinary
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Uploads a base64-encoded image string to Cloudinary.
 * Used for Grad-CAM heatmaps returned from the AI service.
 * @param {string} base64String - Raw base64 (no data URI prefix needed)
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} Secure URL of uploaded heatmap
 */
const uploadBase64 = async (base64String, folder = 'mri-heatmaps') => {
  const dataUri = `data:image/jpeg;base64,${base64String}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
    quality: 'auto',
  });
  return result.secure_url;
};

module.exports = { uploadBuffer, uploadBase64 };
