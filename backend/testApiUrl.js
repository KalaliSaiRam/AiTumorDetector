const axios = require('axios');

async function check() {
  try {
    const res = await axios.post('https://ram2512-ai-tumor-detector.hf.space/predict');
    console.log('/predict worked:', res.status);
  } catch(e) {
    console.error('/predict Error:', e.response?.status, e.response?.statusText);
  }

  try {
    const res = await axios.post('https://ram2512-ai-tumor-detector.hf.space/run/predict', { data: [] });
    console.log('/run/predict worked:', res.status);
  } catch(e) {
    console.error('/run/predict Error:', e.response?.status, e.response?.statusText);
  }
}

check();
