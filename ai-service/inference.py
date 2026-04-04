import torch
from PIL import Image
import numpy as np
import cv2
import base64
import os
import gdown

from model import HybridTriModel
from preprocess import transform
from sec import generate_sec
from gradcam import GradCAM, overlay_heatmap

# ---------------- CONFIG ---------------- #
device = "cpu"  # Render does not support GPU

MODEL_PATH = "model.pth"
FILE_ID = "1AeRfYyL76FargetbenXKISJglsCV-NyV"
MODEL_URL = f"https://drive.google.com/uc?id={FILE_ID}"

model = None
gradcam = None
idx_to_class = None


# ---------------- LOAD MODEL (LAZY) ---------------- #
def load_model():
    global model, gradcam, idx_to_class

    if model is not None:
        return model

    print("🔄 Loading model...")

    # Download model if not exists
    if not os.path.exists(MODEL_PATH):
        print("⬇️ Downloading model from Google Drive...")
        gdown.download(MODEL_URL, MODEL_PATH, quiet=False)

    # Load checkpoint
    checkpoint = torch.load(MODEL_PATH, map_location=device)

    num_classes = checkpoint["num_classes"]
    class_to_idx = checkpoint["class_to_idx"]
    idx_to_class = {v: k for k, v in class_to_idx.items()}

    # Initialize model
    model_instance = HybridTriModel(num_classes)

    state_dict = checkpoint["model_state"]

    # Fix DataParallel prefix
    state_dict = {
        k.replace("module.", "") if k.startswith("module.") else k: v
        for k, v in state_dict.items()
    }

    # Remove unwanted keys
    state_dict.pop("n_averaged", None)

    model_instance.load_state_dict(state_dict)
    model_instance.to(device)
    model_instance.eval()

    model = model_instance
    gradcam = GradCAM(model)

    print("✅ Model loaded successfully!")

    return model


# ---------------- PREDICTION FUNCTION ---------------- #
def predict_image(file):
    global idx_to_class, gradcam

    # Ensure model is loaded
    model_instance = load_model()

    # Read image
    image = Image.open(file.file).convert("RGB")
    img = transform(image).unsqueeze(0).to(device)

    # Forward pass
    with torch.no_grad():
        output = model_instance(img)
        probs = torch.softmax(output, dim=1)
        pred = torch.argmax(probs, dim=1).item()

    # Structured Explanation (SEC)
    sec_output = generate_sec(probs.detach(), idx_to_class)

    # Grad-CAM (requires gradients → no torch.no_grad())
    cam = gradcam.generate_cam(img, pred)

    # Overlay heatmap
    original = np.array(image.resize((224, 224)))
    overlay = overlay_heatmap(original, cam)

    # Convert to base64
    _, buffer = cv2.imencode(".jpg", overlay)
    heatmap_base64 = base64.b64encode(buffer).decode("utf-8")

    # Final output
    sec_output["heatmap"] = heatmap_base64

    return sec_output



# import torch
# from PIL import Image
# import numpy as np
# import cv2
# import base64
# import os
# import gdown

# from model import HybridTriModel
# from preprocess import transform
# from sec import generate_sec
# from gradcam import GradCAM, overlay_heatmap

# # ---------------- CONFIG ---------------- #
# device = "cpu"  # Render does not support GPU

# MODEL_PATH = "model.pth"
# FILE_ID = "1AeRfYyL76FargetbenXKISJglsCV-NyV"
# MODEL_URL = f"https://drive.google.com/uc?id={FILE_ID}"

# model = None
# gradcam = None
# idx_to_class = None


# # ---------------- LOAD MODEL (LAZY) ---------------- #
# def load_model():
#     global model, gradcam, idx_to_class

#     if model is not None:
#         return model

#     print("🔄 Loading model...")

#     # Download model if not exists
#     if not os.path.exists(MODEL_PATH):
#         print("⬇️ Downloading model from Google Drive...")
#         gdown.download(MODEL_URL, MODEL_PATH, quiet=False)

#     # Load checkpoint
#     checkpoint = torch.load(MODEL_PATH, map_location=device)

#     num_classes = checkpoint["num_classes"]
#     class_to_idx = checkpoint["class_to_idx"]
#     idx_to_class = {v: k for k, v in class_to_idx.items()}

#     # Initialize model
#     model_instance = HybridTriModel(num_classes)

#     state_dict = checkpoint["model_state"]

#     # Fix DataParallel prefix
#     state_dict = {
#         k.replace("module.", "") if k.startswith("module.") else k: v
#         for k, v in state_dict.items()
#     }

#     # Remove unwanted keys
#     state_dict.pop("n_averaged", None)

#     model_instance.load_state_dict(state_dict)
#     model_instance.to(device)
#     model_instance.eval()

#     model = model_instance
#     gradcam = GradCAM(model)

#     print("✅ Model loaded successfully!")

#     return model


# # ---------------- PREDICTION FUNCTION ---------------- #
# def predict_image(file):
#     global idx_to_class, gradcam

#     # Ensure model is loaded
#     model_instance = load_model()

#     # Read image
#     image = Image.open(file.file).convert("RGB")
#     img = transform(image).unsqueeze(0).to(device)

#     # Forward pass
#     with torch.no_grad():
#         output = model_instance(img)
#         probs = torch.softmax(output, dim=1)
#         pred = torch.argmax(probs, dim=1).item()

#     # Structured Explanation (SEC)
#     sec_output = generate_sec(probs.detach(), idx_to_class)

#     # Grad-CAM (requires gradients → no torch.no_grad())
#     cam = gradcam.generate_cam(img, pred)

#     # Overlay heatmap
#     original = np.array(image.resize((224, 224)))
#     overlay = overlay_heatmap(original, cam)

#     # Convert to base64
#     _, buffer = cv2.imencode(".jpg", overlay)
#     heatmap_base64 = base64.b64encode(buffer).decode("utf-8")

#     # Final output
#     sec_output["heatmap"] = heatmap_base64

#     return sec_output
