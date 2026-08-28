import io
import numpy as np
from PIL import Image
from ultralytics import YOLO

MODEL_PATH = "models/best.pt"
CLASS_NAMES = ["fake", "real"]
CONFIDENCE_THRESHOLD = 0.8
_model = YOLO(MODEL_PATH)

def check_liveness(image_bytes: bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_array = np.array(image)
    results = _model(img_array, verbose=False)

    best_label = None
    best_conf = 0.0

    for r in results:
        for box in r.boxes:
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            label = CLASS_NAMES[cls]

            if conf > best_conf:
                best_conf = conf
                best_label = label

    if best_label is None:
        return False, "no_face", 0.0
    is_real = (best_label == "real") and (best_conf >= CONFIDENCE_THRESHOLD)
    return is_real, best_label, round(best_conf * 100, 1)