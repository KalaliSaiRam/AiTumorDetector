from fastapi import FastAPI, UploadFile, File  # type: ignore
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import uvicorn
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from inference import predict_image  # type: ignore

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Service is running perfectly"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    result = predict_image(file)
    return result

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)