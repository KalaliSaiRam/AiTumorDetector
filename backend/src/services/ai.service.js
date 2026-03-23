const axios = require('axios');
const FormData = require('form-data');
const config = require('../config/config');

/**
 * Calls the FastAPI AI service with an image URL.
 *
 * Flow:
 *  1. Download image buffer from Cloudinary URL
 *  2. Build multipart/form-data with the image buffer
 *  3. POST to FastAPI /predict endpoint
 *  4. Return { predicted_class, confidence, top_predictions, heatmap }
 *
 * @param {string} imageUrl - Cloudinary secure URL of the MRI scan
 * @returns {Promise<Object>} AI prediction result
 */
const callPredict = async (imageUrl) => {
  // Step 1: Download image as buffer
  const imageResponse = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: 30000,
  });

  const imageBuffer = Buffer.from(imageResponse.data);

  // Determine file extension from URL (default to jpg)
  const urlPath = new URL(imageUrl).pathname;
  const ext = urlPath.split('.').pop() || 'jpg';

  // Step 2: Build multipart form
  const formData = new FormData();
  formData.append('file', imageBuffer, {
    filename: `scan.${ext}`,
    contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
  });

  // Step 3: POST to FastAPI
  const aiResponse = await axios.post(
    `${config.ai.serviceUrl}/predict`,
    formData,
    {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 120000, // 2 min — model inference can take time
    }
  );

  return aiResponse.data;
};

module.exports = { callPredict };
