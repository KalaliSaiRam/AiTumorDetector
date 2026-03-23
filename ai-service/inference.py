import torch  # type: ignore
from PIL import Image  # type: ignore
import numpy as np  # type: ignore
import cv2  # type: ignore
import base64

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model import HybridTriModel  # type: ignore
from preprocess import transform  # type: ignore
from sec import generate_sec  # type: ignore
from gradcam import GradCAM, overlay_heatmap  # type: ignore

device = "cuda" if torch.cuda.is_available() else "cpu"

# ---- LOAD MODEL ----
checkpoint = torch.load("model.pth", map_location=device)

num_classes = checkpoint["num_classes"]
class_to_idx = checkpoint["class_to_idx"]

idx_to_class = {v: k for k, v in class_to_idx.items()}

model = HybridTriModel(num_classes)
state_dict = checkpoint["model_state"]
# Remove 'module.' prefix if it exists (from DataParallel)
state_dict = {k.replace('module.', '') if k.startswith('module.') else k: v for k, v in state_dict.items()}
# Remove 'n_averaged' if it comes from SWAG/EMA which causes unexpected key error
state_dict.pop("n_averaged", None)

model.load_state_dict(state_dict)
model.to(device)
model.eval()

# ---- INIT GRADCAM ----
gradcam = GradCAM(model)


# ---- PREDICTION WITH SEC + HEATMAP ----
def predict_image(file):
    image = Image.open(file.file).convert("RGB")
    img = transform(image).unsqueeze(0).to(device)

    # ---- FORWARD PASS ----
    output = model(img)
    probs = torch.softmax(output, dim=1)
    pred = torch.argmax(probs, dim=1).item()

    # ---- SEC ----
    sec_output = generate_sec(probs.detach(), idx_to_class)

    # ---- GRAD-CAM (requires gradients) ----
    cam = gradcam.generate_cam(img, pred)

    # ---- HEATMAP OVERLAY ----
    original = np.array(image.resize((224, 224)))
    overlay = overlay_heatmap(original, cam)

    # ---- CONVERT TO BASE64 ----
    _, buffer = cv2.imencode(".jpg", overlay)
    heatmap_base64 = base64.b64encode(buffer).decode("utf-8")

    # ---- FINAL OUTPUT ----
    sec_output["heatmap"] = heatmap_base64

    return sec_output
