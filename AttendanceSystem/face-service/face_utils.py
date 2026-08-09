"""
Face detection, embedding extraction, comparison and a basic liveness check.

NOTE ON LIVENESS: the check implemented here (`basic_liveness_check`) is a
simple texture/sharpness heuristic meant to catch the most obvious spoof
case (a printed photo or a phone screen held up to the camera). It is
NOT a substitute for a dedicated anti-spoofing model. For a real
deployment, replace `basic_liveness_check` with a trained liveness/anti-
spoofing model and validate it against your own spoofing test set before
relying on it for security-sensitive attendance.
"""

import io
import numpy as np
import cv2
import face_recognition


def _load_image_from_bytes(image_bytes: bytes) -> np.ndarray:
    """Decode uploaded image bytes into an RGB numpy array."""
    file_bytes = np.frombuffer(image_bytes, dtype=np.uint8)
    bgr_image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    if bgr_image is None:
        raise ValueError("Could not decode image")
    rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)
    return rgb_image, bgr_image


def get_face_embedding(image_bytes: bytes):
    """
    Detect the largest face in the image and return its 128-d embedding.
    Returns None if no face is found.
    """
    rgb_image, _ = _load_image_from_bytes(image_bytes)

    face_locations = face_recognition.face_locations(rgb_image, model="hog")
    if len(face_locations) == 0:
        return None, None

    # Pick the largest face box (closest to camera) if multiple faces appear
    def box_area(box):
        top, right, bottom, left = box
        return (bottom - top) * (right - left)

    largest_box = max(face_locations, key=box_area)
    encodings = face_recognition.face_encodings(rgb_image, known_face_locations=[largest_box])

    if len(encodings) == 0:
        return None, None

    return encodings[0], largest_box


def basic_liveness_check(image_bytes: bytes, face_box) -> bool:
    """
    Very basic anti-spoof heuristic using image sharpness (Laplacian variance)
    over the detected face region. Printed photos / re-photographed screens
    tend to be noticeably blurrier or show moire patterns compared to a real
    face captured directly by a webcam.

    Returns True if the frame is judged "probably live", False otherwise.
    This is intentionally conservative-simple — see module docstring.
    """
    _, bgr_image = _load_image_from_bytes(image_bytes)
    top, right, bottom, left = face_box
    face_crop = bgr_image[max(0, top):bottom, max(0, left):right]

    if face_crop.size == 0:
        return False

    gray = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
    sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()

    # Threshold picked empirically — tune against your own camera/lighting setup.
    return sharpness > 30.0


def cosine_similarity(vec_a, vec_b) -> float:
    a = np.array(vec_a)
    b = np.array(vec_b)
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


def best_match(live_embedding, candidates):
    """
    candidates: list of {"studentId": int, "name": str, "embedding": list[float]}
    Returns (studentId, name, confidence) for the best-scoring candidate,
    or (None, None, 0.0) if candidates is empty.
    """
    best_student_id, best_name, best_score = None, None, 0.0

    for candidate in candidates:
        score = cosine_similarity(live_embedding, candidate["embedding"])
        if score > best_score:
            best_score = score
            best_student_id = candidate["studentId"]
            best_name = candidate["name"]

    return best_student_id, best_name, best_score
