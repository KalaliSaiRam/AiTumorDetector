const { callPredict } = require('./src/services/ai.service.js');

async function test() {
  try {
    // Just hitting a random public image to see if HF blocks the POST
    const res = await callPredict("https://res.cloudinary.com/demo/image/upload/sample.jpg");
    console.log("Success:", res);
  } catch (err) {
    if (err.response) {
      console.log("Error status:", err.response.status);
      console.log("Error data:", err.response.data?.toString('utf8') || err.response.data);
    } else {
      console.log("Error:", err.message);
    }
  }
}

test();
