import datetime
import os
import threading

import hnswlib
import numpy as np
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func
from sqlalchemy.orm import Session

import face_utils
from antispoof_utils import check_liveness
from notification_service import create_notification
from database import Attendance, Student, get_db, get_student_hostel_details


# =========================================================
# CONFIG
# =========================================================

MEDIA_ROOT = "media"
STUDENT_PHOTOS_DIR = os.path.join(MEDIA_ROOT, "students")

HNSW_DIR = "hnsw_data"
HNSW_INDEX_FILE = os.path.join(HNSW_DIR, "students_hnsw.bin")

os.makedirs(STUDENT_PHOTOS_DIR, exist_ok=True)
os.makedirs(HNSW_DIR, exist_ok=True)

# InsightFace ArcFace embeddings are 512-dimensional. 
FACE_EMBEDDING_DIM = 512

HNSW_MAX_ELEMENTS = 100000
HNSW_M = 32
HNSW_EF_CONSTRUCTION = 300
HNSW_EF = 100
HNSW_TOP_K = 5

# These are STARTING values, not probabilities.
# Calibrate them on your own college camera/photos before production.
FACE_SIMILARITY_THRESHOLD = 0.50
FACE_SIMILARITY_MARGIN = 0.05

# Attendance is intentionally stricter than normal search.
ATTENDANCE_SIMILARITY_THRESHOLD = 0.55
ATTENDANCE_SIMILARITY_MARGIN = 0.06

# Liveness is enabled for attendance.
ENABLE_ATTENDANCE_LIVENESS = True


# =========================================================
# ANTI-SPOOFING
# =========================================================

def verify_liveness(image_bytes: bytes):
    try:
        is_real, label, confidence = check_liveness(image_bytes)

        return {
            "passed": bool(is_real),
            "label": str(label),
            "confidence": float(confidence),
        }

    except Exception as error:
        print("Anti-spoof error:", error)

        return {
            "passed": False,
            "label": "error",
            "confidence": 0.0,
        }


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="SmartCampus Face Recognition API",
    version="2.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# MEDIA
# =========================================================

app.mount(
    "/media",
    StaticFiles(directory=MEDIA_ROOT),
    name="media",
)


# =========================================================
# HNSW STATE
# =========================================================

hnsw_index = None

# HNSW label -> database Student.id
hnsw_label_to_student = {}

# database Student.id -> HNSW label
hnsw_student_to_label = {}

hnsw_next_label = 0

# Protect HNSW modifications/search.
hnsw_lock = threading.RLock()


# =========================================================
# VECTOR HELPERS
# =========================================================

def encoding_to_numpy(encoding):
    if encoding is None:
        return None

    try:
        vector = np.asarray(
            encoding,
            dtype=np.float32,
        ).reshape(-1)

    except Exception:
        return None

    if vector.size != FACE_EMBEDDING_DIM:
        raise ValueError(
            f"Invalid face embedding dimension: {vector.size}. "
            f"Expected {FACE_EMBEDDING_DIM}."
        )

    if not np.all(np.isfinite(vector)):
        raise ValueError("Face embedding contains invalid values.")

    return vector


def normalize_vector(vector):
    vector = np.asarray(
        vector,
        dtype=np.float32,
    ).reshape(-1)

    norm = np.linalg.norm(vector)

    if norm <= 0:
        raise ValueError("Zero face embedding")

    return vector / norm


def cosine_similarity(a, b):
    a = normalize_vector(a)
    b = normalize_vector(b)

    return float(np.dot(a, b))


def similarity_to_confidence(similarity: float):
    """
    UI score only.

    IMPORTANT:
    This is NOT a statistical probability and should not be
    presented as "99% certain". It is a normalized display score
    relative to the configured acceptance threshold.
    """

    if similarity is None:
        return 0.0

    similarity = float(similarity)

    # Display scale:
    # threshold -> 0
    # 0.75+ -> 100
    low = FACE_SIMILARITY_THRESHOLD
    high = 0.75

    if high <= low:
        return round(max(0.0, min(100.0, similarity * 100.0)), 1)

    score = ((similarity - low) / (high - low)) * 100.0

    return round(
        max(0.0, min(100.0, score)),
        1,
    )


# =========================================================
# CREATE HNSW INDEX
# =========================================================

def create_hnsw_index():
    global hnsw_index

    index = hnswlib.Index(
        space="cosine",
        dim=FACE_EMBEDDING_DIM,
    )

    index.init_index(
        max_elements=HNSW_MAX_ELEMENTS,
        M=HNSW_M,
        ef_construction=HNSW_EF_CONSTRUCTION,
        random_seed=42,
    )

    index.set_ef(HNSW_EF)

    index.set_num_threads(
        max(
            1,
            os.cpu_count() or 1,
        )
    )

    hnsw_index = index


# =========================================================
# ADD VECTOR
# =========================================================

def add_student_to_hnsw(student_id: int, encoding):
    """
    Add one student embedding to HNSW.

    A student is stored only once in this version.
    """

    global hnsw_next_label

    vector = encoding_to_numpy(encoding)

    if vector is None:
        return False

    vector = normalize_vector(vector)

    with hnsw_lock:
        if hnsw_index is None:
            create_hnsw_index()

        # Do not add the same HNSW label twice.
        if student_id in hnsw_student_to_label:
            return True

        if hnsw_index.get_current_count() >= hnsw_index.get_max_elements():
            raise RuntimeError("HNSW index is full.")

        label = hnsw_next_label
        hnsw_next_label += 1

        hnsw_index.add_items(
            np.asarray([vector], dtype=np.float32),
            np.asarray([label], dtype=np.int64),
        )

        hnsw_label_to_student[label] = student_id
        hnsw_student_to_label[student_id] = label

    return True


# =========================================================
# BUILD HNSW FROM DATABASE
# =========================================================

def build_hnsw_from_database(db: Session):
    global hnsw_index
    global hnsw_next_label

    print("========================================")
    print("Building HNSW face index...")
    print("========================================")

    students = (
        db.query(Student)
        .filter(Student.encoding.isnot(None))
        .all()
    )

    print(f"Students with encodings: {len(students)}")

    create_hnsw_index()

    hnsw_label_to_student.clear()
    hnsw_student_to_label.clear()
    hnsw_next_label = 0

    vectors = []
    labels = []
    valid_students = []

    for student in students:
        try:
            known_encoding = face_utils.json_to_encoding(
                student.encoding
            )

            vector = encoding_to_numpy(known_encoding)

            if vector is None:
                continue

            vector = normalize_vector(vector)

            label = hnsw_next_label
            hnsw_next_label += 1

            vectors.append(vector)
            labels.append(label)
            valid_students.append(student)

        except Exception as error:
            # This is expected for old 128-D embeddings after migration.
            print(
                f"Skipping student {student.id}: {error}"
            )

    if vectors:
        vectors_np = np.asarray(
            vectors,
            dtype=np.float32,
        )

        labels_np = np.asarray(
            labels,
            dtype=np.int64,
        )

        with hnsw_lock:
            hnsw_index.add_items(
                vectors_np,
                labels_np,
                num_threads=max(
                    1,
                    os.cpu_count() or 1,
                ),
            )

        for student, label in zip(
            valid_students,
            labels,
        ):
            hnsw_label_to_student[label] = student.id
            hnsw_student_to_label[student.id] = label

    print(f"HNSW indexed: {len(valid_students)}")
    print("HNSW build completed.")
    print("========================================")


# =========================================================
# SAVE HNSW
# =========================================================

def save_hnsw():
    if hnsw_index is None:
        return

    with hnsw_lock:
        hnsw_index.save_index(HNSW_INDEX_FILE)

    print(f"HNSW saved: {HNSW_INDEX_FILE}")


# =========================================================
# LOAD HNSW
# =========================================================

def load_hnsw_if_possible():
    """
    Kept for compatibility.

    The application currently rebuilds from the database on startup,
    which is safer because the label -> student mapping is reconstructed
    at the same time.
    """

    global hnsw_index

    if not os.path.exists(HNSW_INDEX_FILE):
        return False

    try:
        index = hnswlib.Index(
            space="cosine",
            dim=FACE_EMBEDDING_DIM,
        )

        index.load_index(
            HNSW_INDEX_FILE,
            max_elements=HNSW_MAX_ELEMENTS,
        )

        index.set_ef(HNSW_EF)

        index.set_num_threads(
            max(
                1,
                os.cpu_count() or 1,
            )
        )

        hnsw_index = index
        return True

    except Exception as error:
        print("HNSW load failed:", error)
        hnsw_index = None
        return False


# =========================================================
# REBUILD HNSW
# =========================================================

def rebuild_hnsw(db: Session):
    build_hnsw_from_database(db)
    save_hnsw()


# =========================================================
# SEARCH HNSW
# =========================================================

def hnsw_search(query_encoding, k=HNSW_TOP_K):
    """
    ANN search.

    Returns:
        [(student_id, cosine_distance), ...]
    """

    if hnsw_index is None:
        return []

    vector = encoding_to_numpy(query_encoding)

    if vector is None:
        return []

    vector = normalize_vector(vector)

    with hnsw_lock:
        count = hnsw_index.get_current_count()

        if count <= 0:
            return []

        k = min(int(k), count)

        labels, distances = hnsw_index.knn_query(
            np.asarray([vector], dtype=np.float32),
            k=k,
        )

    results = []

    for label, distance in zip(
        labels[0],
        distances[0],
    ):
        label = int(label)

        student_id = hnsw_label_to_student.get(label)

        if student_id is None:
            continue

        results.append(
            (
                student_id,
                float(distance),
            )
        )

    return results


# =========================================================
# EXACT FACE VERIFICATION
# =========================================================

def exact_verify_candidates(
    query_encoding,
    candidate_ids,
    db: Session,
    threshold=FACE_SIMILARITY_THRESHOLD,
    margin_threshold=FACE_SIMILARITY_MARGIN,
):
    """
    HNSW only finds candidates.

    Final identity decision is made using exact cosine similarity
    against the stored ArcFace embedding.

    Two checks are used:
      1. best similarity must be >= threshold
      2. best similarity must beat second-best by the margin

    Returns:
        (student, best_similarity, margin)
    """

    query = encoding_to_numpy(query_encoding)

    if query is None:
        return None, None, None

    query = normalize_vector(query)

    candidate_ids = list(dict.fromkeys(candidate_ids))

    if not candidate_ids:
        return None, None, None

    students = (
        db.query(Student)
        .filter(
            Student.id.in_(candidate_ids),
            Student.encoding.isnot(None),
        )
        .all()
    )

    scored = []

    for student in students:
        try:
            known = face_utils.json_to_encoding(
                student.encoding
            )

            known = encoding_to_numpy(known)

            if known is None:
                continue

            known = normalize_vector(known)

            similarity = cosine_similarity(
                query,
                known,
            )

            scored.append(
                (
                    similarity,
                    student,
                )
            )

        except Exception as error:
            print(
                "Exact verification error:",
                error,
            )

    if not scored:
        return None, None, None

    scored.sort(
        key=lambda item: item[0],
        reverse=True,
    )

    best_similarity, best_student = scored[0]

    second_similarity = (
        scored[1][0]
        if len(scored) > 1
        else -1.0
    )

    margin = (
        best_similarity - second_similarity
        if len(scored) > 1
        else best_similarity
    )

    if best_similarity < threshold:
        return None, best_similarity, margin

    if len(scored) > 1 and margin < margin_threshold:
        return None, best_similarity, margin

    return (
        best_student,
        best_similarity,
        margin,
    )


# =========================================================
# STARTUP
# =========================================================

@app.on_event("startup")
def startup_event():
    print("Starting SmartCampus Face Recognition API...")

    db = next(get_db())

    try:
        # Always rebuild because the mapping between HNSW labels and
        # database IDs must exactly match the current database.
        rebuild_hnsw(db)

    finally:
        db.close()


# =========================================================
# ENROLL STUDENT
# =========================================================

@app.post("/api/students/enroll")
async def enroll_student(
    student_id: str = Form(...),
    name: str = Form(...),
    course: str = Form(...),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # -------------------------------------------------------
    # CHECK DUPLICATE
    # -------------------------------------------------------

    existing = (
        db.query(Student)
        .filter(Student.student_id == student_id)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Student ID already enrolled",
        )

    # -------------------------------------------------------
    # READ PHOTO
    # -------------------------------------------------------

    image_bytes = await photo.read()

    if not image_bytes:
        raise HTTPException(
            status_code=422,
            detail="Empty image",
        )

    # -------------------------------------------------------
    # EXTRACT FACE + QUALITY CHECK
    # -------------------------------------------------------

    try:
        encoding, face_location = face_utils.extract_encoding(
            image_bytes,
            require_quality=True,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        )

    except Exception as error:
        print("Face extraction error:", error)
        raise HTTPException(
            status_code=422,
            detail="Unable to process enrollment image",
        )

    if encoding is None:
        raise HTTPException(
            status_code=422,
            detail="No usable face detected in enrollment photo",
        )

    # Validate dimension.
    try:
        encoding_to_numpy(encoding)

    except Exception as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        )

    # -------------------------------------------------------
    # PHOTO PATH
    # -------------------------------------------------------

    photo_path = os.path.join(
        STUDENT_PHOTOS_DIR,
        f"{student_id}.jpg",
    )

    with open(photo_path, "wb") as file:
        file.write(image_bytes)

    # -------------------------------------------------------
    # CREATE STUDENT
    # -------------------------------------------------------

    student = Student(
        student_id=student_id,
        name=name,
        course=course,
        photo_path=photo_path,
        encoding=face_utils.encoding_to_json(encoding),
    )

    db.add(student)
    db.commit()
    db.refresh(student)

    # -------------------------------------------------------
    # NOTIFICATION
    # -------------------------------------------------------

    try:
        create_notification(
            db=db,
            user_id=9,
            notification_type="STUDENT_CREATED",
            title="New Student Enrolled",
            message=(
                f"{student.name} From {student.course} "
                "has been successfully enrolled."
            ),
            entity_type="student",
            entity_id=student.id,
            metadata={
                "studentId": student.student_id,
                "name": student.name,
                "course": student.course,
            },
        )

    except Exception as error:
        print("Student notification failed:", error)

    # -------------------------------------------------------
    # ADD TO HNSW
    # -------------------------------------------------------

    try:
        indexed = add_student_to_hnsw(
            student.id,
            encoding,
        )

        save_hnsw()

    except Exception as error:
        indexed = False
        print("HNSW add failed:", error)

    # -------------------------------------------------------
    # RESPONSE
    # -------------------------------------------------------

    return {
        "message": "Student enrolled",
        "student_id": student.student_id,
        "database_id": student.id,
        "hnsw_indexed": bool(indexed),
        "embedding_dimension": FACE_EMBEDDING_DIM,
        "model": getattr(
            face_utils,
            "MODEL_NAME",
            "InsightFace",
        ),
        "face_quality": getattr(
            face_utils,
            "get_last_quality_info",
            lambda: None,
        )(),
    }


# =========================================================
# SEARCH STUDENT BY FACE
# =========================================================

@app.post("/api/students/search")
async def search_face(
    frame: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    image_bytes = await frame.read()

    if not image_bytes:
        raise HTTPException(
            status_code=422,
            detail="Empty image",
        )

    # -------------------------------------------------------
    # FACE ENCODING + QUALITY
    # -------------------------------------------------------

    try:
        encoding, _ = face_utils.extract_encoding(
            image_bytes,
            require_quality=True,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        )

    except Exception as error:
        print("Face extraction error:", error)
        raise HTTPException(
            status_code=422,
            detail="Unable to process submitted frame",
        )

    if encoding is None:
        raise HTTPException(
            status_code=422,
            detail="No usable face detected in submitted frame",
        )

    # -------------------------------------------------------
    # HNSW SEARCH
    # -------------------------------------------------------

    candidates = hnsw_search(
        encoding,
        k=HNSW_TOP_K,
    )

    if not candidates:
        raise HTTPException(
            status_code=404,
            detail="No matching student found",
        )

    candidate_ids = [
        student_id
        for student_id, _distance in candidates
    ]

    # -------------------------------------------------------
    # EXACT VERIFICATION
    # -------------------------------------------------------

    match, similarity, margin = exact_verify_candidates(
        encoding,
        candidate_ids,
        db,
        threshold=FACE_SIMILARITY_THRESHOLD,
        margin_threshold=FACE_SIMILARITY_MARGIN,
    )

    if match is None:
        raise HTTPException(
            status_code=404,
            detail={
                "message": "No matching student found",
                "similarity": (
                    round(float(similarity), 4)
                    if similarity is not None
                    else None
                ),
                "margin": (
                    round(float(margin), 4)
                    if margin is not None
                    else None
                ),
                "required_similarity": FACE_SIMILARITY_THRESHOLD,
                "required_margin": FACE_SIMILARITY_MARGIN,
            },
        )

    confidence = similarity_to_confidence(
        similarity
    )

    hostel = get_student_hostel_details(
        db,
        match.id,
    )

    return {
        "student_id": match.student_id,
        "name": match.name,
        "class": match.course,
        "status": match.status,

        # UI score, not probability.
        "confidence": confidence,
        "accuracy": f"{confidence}%",

        # Real biometric metrics.
        "similarity": round(float(similarity), 4),
        "margin": round(float(margin), 4),

        "liveness": "not_checked",

        "hostel": hostel,

        # Keep "distance" for frontend compatibility.
        "distance": round(
            float(1.0 - similarity),
            4,
        ),

        "image": (
            f"/media/students/"
            f"{os.path.basename(match.photo_path)}"
            if match.photo_path
            else None
        ),
    }


# =========================================================
# MARK ATTENDANCE
# =========================================================

@app.post("/api/students/attendance")
async def mark_attendance(
    frame: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    image_bytes = await frame.read()

    if not image_bytes:
        raise HTTPException(
            status_code=422,
            detail="Empty image",
        )

    # -------------------------------------------------------
    # ANTI-SPOOFING
    # -------------------------------------------------------

    liveness = None

    # if ENABLE_ATTENDANCE_LIVENESS:
    #     liveness = verify_liveness(image_bytes)

    #     if not liveness["passed"]:
    #         raise HTTPException(
    #             status_code=403,
    #             detail={
    #                 "message": "Live face required.",
    #                 "liveness": liveness["label"],
    #                 "liveness_confidence": liveness["confidence"],
    #             },
                
    #         )

    # -------------------------------------------------------
    # FACE EXTRACTION + QUALITY
    # -------------------------------------------------------

    try:
        encoding, _ = face_utils.extract_encoding(
            image_bytes,
            require_quality=True,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        )

    except Exception as error:
        print("Face extraction error:", error)
        raise HTTPException(
            status_code=422,
            detail="Unable to process attendance frame",
        )

    if encoding is None:
        raise HTTPException(
            status_code=422,
            detail="No usable face detected",
        )

    # -------------------------------------------------------
    # HNSW
    # -------------------------------------------------------

    candidates = hnsw_search(
        encoding,
        k=HNSW_TOP_K,
    )

    if not candidates:
        raise HTTPException(
            status_code=404,
            detail={
                "message": "No matching student found"
            },
        )

    candidate_ids = [
        student_id
        for student_id, _distance in candidates
    ]

    # -------------------------------------------------------
    # EXACT VERIFICATION
    # -------------------------------------------------------

    match, similarity, margin = exact_verify_candidates(
        encoding,
        candidate_ids,
        db,
        threshold=ATTENDANCE_SIMILARITY_THRESHOLD,
        margin_threshold=ATTENDANCE_SIMILARITY_MARGIN,
    )

    if match is None:
        raise HTTPException(
            status_code=404,
            detail={
                "message": "Face verification failed",
                "similarity": (
                    round(float(similarity), 4)
                    if similarity is not None
                    else None
                ),
                "margin": (
                    round(float(margin), 4)
                    if margin is not None
                    else None
                ),
                "required_similarity":
                    ATTENDANCE_SIMILARITY_THRESHOLD,
                "required_margin":
                    ATTENDANCE_SIMILARITY_MARGIN,
            },
        )

    # -------------------------------------------------------
    # STUDENT STATUS
    # -------------------------------------------------------

    if str(match.status).strip().lower() != "active":
        raise HTTPException(
            status_code=403,
            detail={
                "message": f"Mr {match.name}, please Activate your Profile."
            },
        )


    # -------------------------------------------------------
    # UI SCORE
    # -------------------------------------------------------

    confidence = similarity_to_confidence(
        similarity
    )

    # -------------------------------------------------------
    # TODAY ATTENDANCE
    # -------------------------------------------------------

    today = datetime.date.today()

    existing = (
        db.query(Attendance)
        .filter(
            Attendance.student_id == match.id,
            Attendance.date == today,
        )
        .first()
    )

    # -------------------------------------------------------
    # ALREADY PRESENT
    # -------------------------------------------------------

    if existing:
        status = "Already Present"
        attendance = existing

    # -------------------------------------------------------
    # FIRST ATTENDANCE
    # -------------------------------------------------------

    else:
        attendance = Attendance(
            student_id=match.id,
            date=today,
            confidence=confidence,
        )

        db.add(attendance)
        db.commit()
        db.refresh(attendance)

        status = "Present"

    # -------------------------------------------------------
    # ATTENDANCE %
    # -------------------------------------------------------

    attendance_pct = _attendance_percentage(
        db,
        match,
    ) 

    # -------------------------------------------------------
    # RESPONSE
    # -------------------------------------------------------

    return {
        "id": match.student_id,
        "student_id": match.student_id,
        "name": match.name,
        "class": match.course,

        "status": status,

        # UI score only.
        "confidence": confidence,
        "accuracy": f"{confidence}%",

        # Actual verification metrics.
        "similarity": round(float(similarity), 4),
        "margin": round(float(margin), 4),

        "distance": round(
            float(1.0 - similarity),
            4,
        ),

        "liveness": (
            liveness["label"]
            if liveness
            else "not_checked"
        ),

        "liveness_confidence": (
            liveness["confidence"]
            if liveness
            else None
        ),

        "attendance": f"{attendance_pct}%",

        "time": (
            attendance.marked_at.isoformat()
            if attendance.marked_at
            else None
        ),

        "date": (
            attendance.date.isoformat()
            if attendance.date
            else None
        ),

        "image": (
            f"/media/students/"
            f"{os.path.basename(match.photo_path)}"
            if match.photo_path
            else None
        ),
    }


# =========================================================
# ALL STUDENTS
# =========================================================

@app.get("/api/students")
def list_students(
    db: Session = Depends(get_db),
):
    students = db.query(Student).all()

    result = []

    for student in students:
        if not student.encoding:
            continue

        result.append(
            {
                "id": student.student_id,
                "name": student.name,
                "class": student.course,
                "status": student.status,
                "image": (
                    f"/media/students/"
                    f"{os.path.basename(student.photo_path)}"
                    if student.photo_path
                    else None
                ),
            }
        )

    return result


# =========================================================
# MARK ATTENDANCE ONCE TODAY
# =========================================================

def _mark_attendance_once_today(
    db: Session,
    student_id: int,
    confidence: float,
):
    today = datetime.date.today()

    already_marked = (
        db.query(Attendance)
        .filter(
            Attendance.student_id == student_id,
            Attendance.date == today,
        )
        .first()
    )

    if already_marked:
        return already_marked, True

    attendance = Attendance(
        student_id=student_id,
        date=today,
        confidence=confidence,
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return attendance, False


# =========================================================
# ATTENDANCE PERCENTAGE
# =========================================================

def _attendance_percentage(
    db: Session,
    student: Student,
) -> float:
    today = datetime.date.today()

    if not student.created_at:
        total_days = 1

    else:
        total_days = (
            today - student.created_at.date()
        ).days + 1

        total_days = max(
            total_days,
            1,
        )

    present_days = (
        db.query(
            func.count(
                func.distinct(
                    Attendance.date
                )
            )
        )
        .filter(
            Attendance.student_id == student.id
        )
        .scalar()
    ) or 0

    return round(
        min(
            (
                present_days
                / total_days
            ) * 100,
            100,
        ),
        1,
    )


# =========================================================
# TODAY ATTENDANCE
# =========================================================

@app.get("/api/attendance/today")
def get_today_attendance(
    db: Session = Depends(get_db),
):
    today = datetime.date.today()
    records = (
        db.query(
            Attendance,
            Student,
        )
        .join(
            Student,
            Attendance.student_id == Student.id,
        )
        .filter(
            Attendance.date == today
        )
        .order_by(
            Attendance.marked_at.desc(),
            Attendance.id.desc(),
        )
        .all()
    )

    result = []

    for attendance, student in records:
        attendance_percentage = _attendance_percentage(
            db,
            student,
        )

        confidence = (
            round(
                float(attendance.confidence),
                1,
            )
            if attendance.confidence is not None
            else None
        )

        result.append(
            {
                "id": attendance.id,
                "student_id": student.student_id,
                "name": student.name,
                "class": student.course,
                "status": "Present",

                "date": (
                    attendance.date.isoformat()
                    if attendance.date
                    else None
                ),

                "time": (
                    attendance.marked_at.isoformat()
                    if attendance.marked_at
                    else None
                ),

                "marked_at": (
                    attendance.marked_at.isoformat()
                    if attendance.marked_at
                    else None
                ),

                "confidence": confidence,

                "accuracy": (
                    f"{confidence}%"
                    if confidence is not None
                    else None
                ),

                "attendance": (
                    f"{attendance_percentage}%"
                ),

                "image": (
                    f"/media/students/"
                    f"{os.path.basename(student.photo_path)}"
                    if student.photo_path
                    else None
                ),
            }
        )

    return result


# =========================================================
# HNSW STATUS
# =========================================================

@app.get("/api/hnsw/status")
def hnsw_status():
    if hnsw_index is None:
        return {
            "ready": False,
            "count": 0,
            "max_elements": HNSW_MAX_ELEMENTS,
            "dimension": FACE_EMBEDDING_DIM,
            "space": "cosine",
        }

    return {
        "ready": True,
        "count": hnsw_index.get_current_count(),
        "max_elements": hnsw_index.get_max_elements(),

        "dimension": FACE_EMBEDDING_DIM,
        "space": "cosine",

        "M": HNSW_M,
        "ef_construction": HNSW_EF_CONSTRUCTION,
        "ef": HNSW_EF,
        "top_k": HNSW_TOP_K,

        "search_similarity_threshold":
            FACE_SIMILARITY_THRESHOLD,

        "search_similarity_margin":
            FACE_SIMILARITY_MARGIN,

        "attendance_similarity_threshold":
            ATTENDANCE_SIMILARITY_THRESHOLD,

        "attendance_similarity_margin":
            ATTENDANCE_SIMILARITY_MARGIN,

        "model": getattr(
            face_utils,
            "MODEL_NAME",
            "InsightFace",
        ),
    }


# =========================================================
# MANUAL REBUILD
# =========================================================

@app.post("/api/hnsw/rebuild")
def manual_rebuild(
    db: Session = Depends(get_db),
):
    try:
        rebuild_hnsw(db)

        return {
            "message": "HNSW rebuilt successfully",
            "count": (
                hnsw_index.get_current_count()
                if hnsw_index
                else 0
            ),
            "dimension": FACE_EMBEDDING_DIM,
            "model": getattr(
                face_utils,
                "MODEL_NAME",
                "InsightFace",
            ),
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )
