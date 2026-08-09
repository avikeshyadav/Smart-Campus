import datetime
import os

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func
from sqlalchemy.orm import Session

import face_utils
from database import Attendance, Student, get_db

MEDIA_ROOT = "media"
STUDENT_PHOTOS_DIR = os.path.join(MEDIA_ROOT, "students")
os.makedirs(STUDENT_PHOTOS_DIR, exist_ok=True)

app = FastAPI(title="Face Register API")

# Dev-friendly CORS. Replace allow_origins with your actual frontend URL in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media", StaticFiles(directory=MEDIA_ROOT), name="media")


@app.post("/api/students/enroll")
async def enroll_student(
    student_id: str = Form(...),
    name: str = Form(...),
    class_name: str = Form(...),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if db.query(Student).filter(Student.id == student_id).first():
        raise HTTPException(400, "Student ID already enrolled")

    image_bytes = await photo.read()
    encoding, _ = face_utils.extract_encoding(image_bytes)
    if encoding is None:
        raise HTTPException(422, "No face detected in the enrollment photo")

    photo_path = os.path.join(STUDENT_PHOTOS_DIR, f"{student_id}.jpg")
    with open(photo_path, "wb") as f:
        f.write(image_bytes)

    student = Student(
        student_id=student_id,
        name=name,
        class_name=class_name,
        photo_path=photo_path,
        encoding=face_utils.encoding_to_json(encoding),
    )
    db.add(student)
    db.commit()

    return {"message": "Student enrolled", "student_id": student_id}


@app.post("/api/students/search")
async def search_face(
    frame: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    image_bytes = await frame.read()
    encoding, _ = face_utils.extract_encoding(image_bytes)
    if encoding is None:
        raise HTTPException(422, "No face detected in the submitted frame")

    students = db.query(Student).all()
    known = [(s, face_utils.json_to_encoding(s.encoding)) for s in students]

    match, distance = face_utils.best_match(encoding, known)
    if match is None:
        raise HTTPException(404, "No matching student found")

    confidence = face_utils.distance_to_confidence(distance)
    _mark_attendance_once_today(db, match.id, confidence)
    attendance_pct = _attendance_percentage(db, match)

    return {
        "id": match.student_id,
        "name": match.name,
        "class": match.class_name,
        "status": match.status,
        "accuracy": f"{confidence}%",
        "attendance": f"{attendance_pct}%",
        "image": f"/media/students/{os.path.basename(match.photo_path)}",
    }


@app.get("/api/students")
def list_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return [
        {
            "id": s.student_id,
            "name": s.name,
            "class": s.class_name,
            "status": s.status,
            "image": f"/media/students/{os.path.basename(s.photo_path)}",
        }
        for s in students
        if s.encoding
    ]


def _mark_attendance_once_today(db: Session, student_id: str, confidence: float) -> None:
    today = datetime.date.today()
    already_marked = (
        db.query(Attendance)
        .filter(Attendance.student_id == student_id, Attendance.date == today)
        .first()
    )
    if not already_marked:
        db.add(Attendance(student_id=student_id, date=today, confidence=confidence))
        db.commit()


def _attendance_percentage(db: Session, student: Student) -> float:
    total_days = (datetime.date.today() - student.created_at.date()).days + 1
    total_days = max(total_days, 1)

    present_days = (
        db.query(func.count(func.distinct(Attendance.date)))
        .filter(Attendance.student_id == student.id)
        .scalar()
    )

    return round(min((present_days / total_days) * 100, 100), 1)
