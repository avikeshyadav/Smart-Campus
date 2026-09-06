import io
import json

import face_recognition
import numpy as np

# face_recognition distances for a correct match are usually well under 0.6.
# Lower threshold = stricter matching = fewer false positives.
MATCH_THRESHOLD = 0.5


def extract_encoding(image_bytes: bytes):
    """Return (encoding, face_location) for the first face found, or (None, None)."""
    image = face_recognition.load_image_file(io.BytesIO(image_bytes))
    locations = face_recognition.face_locations(image, model="hog")
    if not locations:
        return None, None

    encodings = face_recognition.face_encodings(image, known_face_locations=locations)
    if not encodings:
        return None, None

    return encodings[0], locations[0]


def encoding_to_json(encoding: np.ndarray) -> str:
    return json.dumps(encoding.tolist())


def json_to_encoding(data: str) -> np.ndarray:
    return np.array(json.loads(data))


def best_match(unknown_encoding, known_students):
    """
    known_students: list of (Student, encoding_array) tuples already loaded from the DB.
    Returns (Student, distance) for the closest match under MATCH_THRESHOLD,
    or (None, distance_of_closest_miss).
    """
    if not known_students:
        return None, None

    encodings = np.array([enc for _, enc in known_students])
    distances = face_recognition.face_distance(encodings, unknown_encoding)

    best_idx = int(np.argmin(distances))
    best_distance = float(distances[best_idx])

    if best_distance <= MATCH_THRESHOLD:
        return known_students[best_idx][0], best_distance
    return None, best_distance


def distance_to_confidence(distance: float) -> float:
    """
    Rough, uncalibrated distance -> percentage conversion for display purposes only.
    Do not treat this as a statistical probability of correctness.
    """
    confidence = max(0.0, (1 - distance)) * 100
    return round(confidence, 1)
