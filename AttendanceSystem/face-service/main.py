"""
Stateless computer-vision service: face detection, embedding extraction,
liveness check and embedding comparison.

Design note: this service holds NO database connection and NO persistent
student data. MySQL (via the Node backend) remains the single source of
truth for students/embeddings/attendance — this service only turns images
into numbers and compares numbers, matching the separation of concerns
recommended for this project:
    Python  -> computer vision (detection, recognition, liveness)
    Node    -> auth, business logic, attendance rules, MySQL
"""

import json
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from face_utils import get_face_embedding, basic_liveness_check, best_match

app = FastAPI(title="Face Recognition Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"success": True, "service": "face-recognition"}


@app.post("/face/embedding")
async def face_embedding(image: UploadFile = File(...)):
    """
    Used during ENROLLMENT. Takes one face image and returns its embedding.
    The Node backend stores the embedding in `student_faces`.
    """
    image_bytes = await image.read()

    try:
        embedding, face_box = get_face_embedding(image_bytes)
    except ValueError:
        return {"success": False, "message": "Invalid image"}

    if embedding is None:
        return {"success": False, "message": "No face detected in image"}

    return {"success": True, "embedding": embedding.tolist()}


@app.post("/face/compare")
async def face_compare(image: UploadFile = File(...), candidates: str = Form(...)):
    """
    Used during RECOGNITION. Takes one live frame plus a list of candidate
    students with their stored embeddings (fetched from MySQL by Node),
    and returns the best match, its confidence, and a liveness verdict.

    candidates: JSON string -> [{"studentId": int, "name": str, "embedding": [float,...]}, ...]
    """
    image_bytes = await image.read()

    try:
        candidate_list = json.loads(candidates)
    except json.JSONDecodeError:
        return {"success": False, "faceDetected": False, "message": "Invalid candidates payload"}

    try:
        live_embedding, face_box = get_face_embedding(image_bytes)
    except ValueError:
        return {"success": False, "faceDetected": False, "message": "Invalid image"}

    if live_embedding is None:
        return {"success": True, "faceDetected": False, "matched": False, "live": False, "confidence": 0.0}

    is_live = basic_liveness_check(image_bytes, face_box)

    if not is_live:
        return {"success": True, "faceDetected": True, "matched": False, "live": False, "confidence": 0.0}

    student_id, name, confidence = best_match(live_embedding, candidate_list)

    return {
        "success": True,
        "faceDetected": True,
        "live": True,
        "matched": student_id is not None,
        "studentId": student_id,
        "name": name,
        "confidence": round(confidence, 4),
    }
