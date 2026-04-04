const axios = require('axios');
const { Client } = require('@gradio/client');
const config = require('../config/config');

/**
 * Calls the Hugging Face Gradio AI service with an image URL.
 *
 * Flow:
 *  1. Download image from Cloudinary
 *  2. Pass as Blob to Gradio Client
 *  3. Return standardized prediction format
 *
 * @param {string} imageUrl - Cloudinary secure URL of the MRI scan
 * @returns {Promise<Object>} AI prediction result
 */
const callPredict = async (imageUrl) => {
  // Step 1: Download image as Buffer to create a Blob
  const imageResponse = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: 30000,
  });

  const urlPath = new URL(imageUrl).pathname;
  const ext = urlPath.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
  
  const blob = new Blob([imageResponse.data], { type: mimeType });

  // Step 2: Use Gradio Client to call the HF Space
  const client = await Client.connect("ram2512/ai-tumor-detector");
  
  const result = await client.predict("/predict", {
    file: blob,
  });

  // Result is [prediction_string, confidence_number, heatmap_base64_string]
  const [predicted_class, confidence, heatmapData] = result.data;

  // Ensure heatmap is pure base64 for `uploadBase64` inside cloudinary.service.js
  let heatmapBase64 = heatmapData;
  if (typeof heatmapData === 'string' && heatmapData.includes('base64,')) {
    heatmapBase64 = heatmapData.split('base64,')[1];
  } else if (typeof heatmapData === 'string' && heatmapData.startsWith('http')) {
    const imgRes = await axios.get(heatmapData, { responseType: 'arraybuffer' });
    heatmapBase64 = Buffer.from(imgRes.data).toString('base64');
  } else if (heatmapData && heatmapData.url) {
    // If Gradio returned a file object { url: ... }
    const imgRes = await axios.get(heatmapData.url, { responseType: 'arraybuffer' });
    heatmapBase64 = Buffer.from(imgRes.data).toString('base64');
  }

  // HF Space doesn't output top_predictions directly via Gradio API, so we build it
  const top_predictions = [
    { class: predicted_class.toUpperCase(), confidence: confidence }
  ];

  return {
    predicted_class: predicted_class.toUpperCase(),
    confidence: confidence,
    top_predictions: top_predictions,
    heatmap: heatmapBase64
  };
};

module.exports = { callPredict };
