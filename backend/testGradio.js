const axios = require('axios');
const FormData = require('form-data');

async function testGradio() {
    try {
        const formData = new FormData();
        // we can fetch a sample image and attach it
        const imageResponse = await axios.get("https://res.cloudinary.com/demo/image/upload/sample.jpg", { responseType: 'arraybuffer' });
        formData.append("file", Buffer.from(imageResponse.data), { filename: "test.jpg", contentType: "image/jpeg" });

        const response = await axios.post(
            "https://ram2512-ai-tumor-detector.hf.space/run/predict",
            formData,
            { headers: formData.getHeaders() }
        );

        console.log("SUCCESS:", JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error("ERROR:");
        if (error.response) {
            console.error(error.response.status, error.response.statusText);
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testGradio();
