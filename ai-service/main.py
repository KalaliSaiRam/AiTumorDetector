from fastapi import FastAPI, UploadFile, File  # type: ignore
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from inference import predict_image  # type: ignore

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "AI Service is running perfectly"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    result = predict_image(file)
    return result