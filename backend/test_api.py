import os
import time
import requests
from PIL import Image
import numpy as np

# Create a dummy image
img_array = np.random.rand(224, 224, 3) * 255
img = Image.fromarray(img_array.astype('uint8')).convert('RGB')
img.save("test_mri.jpg")

BASE_URL = "http://localhost:5000/api"

# 1. Register Admin
print("Registering Admin...")
reg_data = {
    "name": "Test Admin",
    "email": f"admin_{int(time.time())}@test.com",
    "password": "password123",
    "role": "ADMIN"
}
res = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
if res.status_code not in [201, 200, 409]:
    print(res.text)
    exit(1)

# 2. Login
print("Logging in...")
log_data = {
    "email": reg_data["email"],
    "password": reg_data["password"]
}
res = requests.post(f"{BASE_URL}/auth/login", json=log_data)
if res.status_code != 200:
    print("Login failed", res.text)
    exit(1)
token = res.json()["data"]["token"]
headers = {"Authorization": f"Bearer {token}"}
print("Login successful.")

# 3. Create Patient
print("Creating Patient...")
pat_data = {
    "name": "John Doe",
    "age": 45,
    "gender": "MALE",
    "contact": "1234567890"
}
res = requests.post(f"{BASE_URL}/patients", json=pat_data, headers=headers)
if res.status_code != 201:
    print("Patient creation failed", res.text)
    exit(1)
patient_id = res.json()["data"]["id"]
print("Patient created with ID:", patient_id)

# 4. Upload Scan
print("Uploading Scan...")
files = {'image': open('test_mri.jpg', 'rb')}
data = {'patientId': patient_id}
res = requests.post(f"{BASE_URL}/scans/upload", files=files, data=data, headers=headers)
if res.status_code != 201:
    print("Scan upload failed", res.text)
    exit(1)
scan_id = res.json()["data"]["scanId"]
print("Scan uploaded with ID:", scan_id)

# 5. Predict Scan
print("Running AI Prediction...")
res = requests.post(f"{BASE_URL}/scans/{scan_id}/predict", headers=headers)
res_json = res.json()
if res.status_code != 200:
    print("Prediction failed", res.text)
    exit(1)

print("SUCCESS! Prediction Result:")
print({
    "predicted_class": res_json["data"]["prediction"]["predictedClass"],
    "confidence": res_json["data"]["prediction"]["confidence"]
})
