import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from inference import predict_image

class MockFile:
    def __init__(self, path):
        self.file = open(path, "rb")

try:
    print("Running local inference...")
    res = predict_image(MockFile("../backend/test_mri.jpg"))
    print("SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
