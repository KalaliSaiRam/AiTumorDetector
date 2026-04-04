import express from "express";
import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data";

const app = express();

app.post("/predict", async (req, res) => {
    try {
        const formData = new FormData();
        formData.append("file", fs.createReadStream(req.file.path));

        const response = await fetch(
            "https://ram2512-ai-tumor-detector.hf.space/run/predict",
            {
                method: "POST",
                body: formData,
            }
        );

        const result = await response.json();

        // HF returns:
        // { data: [prediction, confidence, heatmap] }

        const [prediction, confidence, heatmap] = result.data;

        res.json({
            prediction,
            confidence,
            heatmap,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Prediction failed" });
    }
});