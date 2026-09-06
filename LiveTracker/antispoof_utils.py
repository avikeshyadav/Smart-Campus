import io
import numpy as np
from PIL import Image
from ultralytics import YOLO

MODEL_PATH = "models/other.pt"

CLASS_NAMES = ["fake", "real"]

CONFIDENCE_THRESHOLD = 0.80

_model = YOLO(MODEL_PATH)


def check_liveness(image_bytes: bytes):
    """
    Check whether the submitted face image is real or fake.

    Returns:
        (is_real, label, confidence_percent)
    """

    try:
        image = (
            Image.open(io.BytesIO(image_bytes))
            .convert("RGB")
        )
    except Exception:
        return False, "invalid_image", 0.0

    img_array = np.array(image)

    results = _model(
        img_array,
        verbose=False
    )

    best_label = None
    best_conf = 0.0

    for result in results:

        if result.boxes is None:
            continue

        for box in result.boxes:

            conf = float(
                box.conf[0]
            )

            cls = int(
                box.cls[0]
            )

            if cls < 0 or cls >= len(CLASS_NAMES):
                continue

            label = CLASS_NAMES[cls]

            if conf > best_conf:
                best_conf = conf
                best_label = label

    if best_label is None:
        return False, "no_face", 0.0

    confidence_percent = round(
        best_conf * 100,
        1
    )

    is_real = (
        best_label == "real"
        and
        best_conf >= CONFIDENCE_THRESHOLD
    )

    return (
        is_real,
        best_label,
        confidence_percent
    )
