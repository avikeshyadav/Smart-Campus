import datetime
import os
import threading
from typing import List
import hnswlib
import numpy as np
from fastapi import (
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func
from sqlalchemy.orm import Session
import face_utils
from antispoof_utils import check_liveness
from notification_service import create_notification
from database import (
    Attendance,
    Student,
    get_db,
)

ATTENDANCE_CONFIDENCE_THRESHOLD = 90.0
# =========================================================
# CONFIG
# =========================================================

MEDIA_ROOT = "media"
STUDENT_PHOTOS_DIR = os.path.join(
    MEDIA_ROOT,
    "students",
)

HNSW_DIR = "hnsw_data"
HNSW_INDEX_FILE = os.path.join(
    HNSW_DIR,
    "students_hnsw.bin",
)
os.makedirs(
    STUDENT_PHOTOS_DIR,
    exist_ok=True,
)

os.makedirs(
    HNSW_DIR,
    exist_ok=True,
)

FACE_EMBEDDING_DIM = 128
HNSW_MAX_ELEMENTS = 100000
HNSW_M = 32
HNSW_EF_CONSTRUCTION = 300
HNSW_EF = 100
HNSW_TOP_K = 5
FACE_DISTANCE_THRESHOLD = 0.85
# =========================================================
# ANTI-SPOOFING
# =========================================================

def verify_liveness(image_bytes: bytes):

    try:
        is_real, label, confidence = check_liveness(
            image_bytes
        )

        return {
            "passed": bool(is_real),
            "label": label,
            "confidence": float(confidence),
        }

    except Exception as error:

        print(
            "Anti-spoof error:",
            error,
        )

        return {
            "passed": False,
            "label": "error",
            "confidence": 0.0,
        }

# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="Face Register API"
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
    StaticFiles(
        directory=MEDIA_ROOT
    ),
    name="media",
)

hnsw_index = None

#
hnsw_label_to_student = {}

# Student database ID -> HNSW label
hnsw_student_to_label = {}

# Next HNSW label
hnsw_next_label = 0

# Protect index modifications.
hnsw_lock = threading.RLock()


# =========================================================
# VECTOR HELPERS
# =========================================================

def encoding_to_numpy(
    encoding,
):
    """
    Convert face encoding to float32 numpy vector.
    """

    if encoding is None:
        return None

    try:
        vector = np.asarray(
            encoding,
            dtype=np.float32,
        )
    except Exception:
        return None

    vector = vector.reshape(-1)

    if vector.size != FACE_EMBEDDING_DIM:
        raise ValueError(
            f"Invalid face embedding dimension: "
            f"{vector.size}. "
            f"Expected {FACE_EMBEDDING_DIM}."
        )

    return vector


def normalize_vector(
    vector,
):

    vector = np.asarray(
        vector,
        dtype=np.float32,
    )

    norm = np.linalg.norm(
        vector
    )

    if norm <= 0:
        raise ValueError(
            "Zero face embedding"
        )

    return vector / norm


# =========================================================
# CREATE HNSW INDEX
# =========================================================

def create_hnsw_index():
    """
    Create an empty HNSW index.
    """

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

    index.set_ef(
        HNSW_EF
    )

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

def add_student_to_hnsw(
    student_id: int,
    encoding,
):
    """
    Add one student encoding to HNSW.
    """

    global hnsw_next_label

    vector = encoding_to_numpy(
        encoding
    )

    if vector is None:
        return

    vector = normalize_vector(
        vector
    )

    with hnsw_lock:

        # Already exists
        if (
            student_id
            in hnsw_student_to_label
        ):
            label = (
                hnsw_student_to_label[
                    student_id
                ]
            )

            hnsw_index.add_items(
                np.asarray(
                    [vector],
                    dtype=np.float32,
                ),
                np.asarray(
                    [label],
                    dtype=np.int64,
                ),
            )

            return

        label = hnsw_next_label

        hnsw_next_label += 1

        hnsw_index.add_items(
            np.asarray(
                [vector],
                dtype=np.float32,
            ),
            np.asarray(
                [label],
                dtype=np.int64,
            ),
        )

        hnsw_label_to_student[
            label
        ] = student_id

        hnsw_student_to_label[
            student_id
        ] = label


# =========================================================
# BUILD HNSW FROM DATABASE
# =========================================================

def build_hnsw_from_database(
    db: Session,
):
    """
    Build complete HNSW index from students table.
    """

    global hnsw_index
    global hnsw_next_label

    print(
        "========================================"
    )

    print(
        "Building HNSW face index..."
    )

    print(
        "========================================"
    )

    students = (
        db.query(Student)
        .filter(
            Student.encoding.isnot(None)
        )
        .all()
    )

    print(
        f"Students with encodings: "
        f"{len(students)}"
    )

    # Create fresh index
    create_hnsw_index()

    hnsw_label_to_student.clear()

    hnsw_student_to_label.clear()

    hnsw_next_label = 0

    vectors = []

    labels = []

    valid_students = []

    for student in students:

        try:
            vector = encoding_to_numpy(
                face_utils.json_to_encoding(
                    student.encoding
                )
            )

            if vector is None:
                continue

            vector = normalize_vector(
                vector
            )

            label = hnsw_next_label

            hnsw_next_label += 1

            vectors.append(
                vector
            )

            labels.append(
                label
            )

            valid_students.append(
                student
            )

        except Exception as error:

            print(
                f"Skipping student "
                f"{student.id}: "
                f"{error}"
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

        for (
            student,
            label,
        ) in zip(
            valid_students,
            labels,
        ):

            hnsw_label_to_student[
                label
            ] = student.id

            hnsw_student_to_label[
                student.id
            ] = label

    print(
        f"HNSW indexed: "
        f"{len(valid_students)}"
    )

    print(
        "HNSW build completed."
    )

    print(
        "========================================"
    )


# =========================================================
# SAVE HNSW
# =========================================================

def save_hnsw():
    """
    Save HNSW graph to disk.
    """

    if hnsw_index is None:
        return

    with hnsw_lock:

        hnsw_index.save_index(
            HNSW_INDEX_FILE
        )

    print(
        f"HNSW saved: "
        f"{HNSW_INDEX_FILE}"
    )


# =========================================================
# LOAD HNSW
# =========================================================

def load_hnsw_if_possible():
    """
    Load saved HNSW graph.

    IMPORTANT:
    Mapping still comes from database.
    """

    global hnsw_index

    if not os.path.exists(
        HNSW_INDEX_FILE
    ):
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

        index.set_ef(
            HNSW_EF
        )

        index.set_num_threads(
            max(
                1,
                os.cpu_count() or 1,
            )
        )

        hnsw_index = index

        return True

    except Exception as error:

        print(
            "HNSW load failed:",
            error,
        )

        hnsw_index = None

        return False


# =========================================================
# REBUILD HNSW
# =========================================================

def rebuild_hnsw(
    db: Session,
):
    """
    Completely rebuild index.
    """

    build_hnsw_from_database(
        db
    )

    save_hnsw()


# =========================================================
# SEARCH HNSW
# =========================================================

def hnsw_search(
    query_encoding,
    k=HNSW_TOP_K,
):
    """
    ANN search.

    Returns:
        [(student_id, cosine_distance), ...]
    """

    if hnsw_index is None:
        return []

    vector = encoding_to_numpy(
        query_encoding
    )

    if vector is None:
        return []

    vector = normalize_vector(
        vector
    )

    with hnsw_lock:

        count = (
            hnsw_index.get_current_count()
        )

        if count <= 0:
            return []

        k = min(
            k,
            count,
        )

        labels, distances = (
            hnsw_index.knn_query(
                np.asarray(
                    [vector],
                    dtype=np.float32,
                ),
                k=k,
            )
        )

    results = []

    for label, distance in zip(
        labels[0],
        distances[0],
    ):

        label = int(label)

        student_id = (
            hnsw_label_to_student.get(
                label
            )
        )

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
):
    """
    HNSW gives candidates.

    This function does exact face-distance
    verification on those candidates.

    This gives better accuracy than blindly
    trusting ANN result.
    """

    query = encoding_to_numpy(
        query_encoding
    )

    if query is None:
        return None, None

    query = normalize_vector(
        query
    )

    students = (
        db.query(Student)
        .filter(
            Student.id.in_(
                candidate_ids
            ),
            Student.encoding.isnot(None),
        )
        .all()
    )

    best_student = None
    best_distance = float(
        "inf"
    )

    for student in students:

        try:

            known = (
                face_utils.json_to_encoding(
                    student.encoding
                )
            )

            known = encoding_to_numpy(
                known
            )

            if known is None:
                continue

            known = normalize_vector(
                known
            )

            # -------------------------------------------------
            # COSINE DISTANCE
            # -------------------------------------------------

            distance = float(
                1.0 -
                np.dot(
                    query,
                    known,
                )
            )

            if (
                distance
                < best_distance
            ):

                best_distance = (
                    distance
                )

                best_student = (
                    student
                )

        except Exception as error:

            print(
                "Exact verification error:",
                error,
            )

    if (
        best_student is None
    ):
        return None, None

    if (
        best_distance
        > FACE_DISTANCE_THRESHOLD
    ):
        return None, best_distance

    return (
        best_student,
        best_distance,
    )


# =========================================================
# CONFIDENCE
# =========================================================

def face_distance_to_confidence(
    distance: float,
):

    if distance is None:
        return 0.0

    # Threshold based display.
    #
    # distance 0.00 -> 100
    # distance threshold -> 0
    #
    confidence = (
        1.0
        -
        (
            distance
            /
            FACE_DISTANCE_THRESHOLD
        )
    ) * 100.0
    return round(
        max(
            0.0,
            min(
                100.0,
                confidence,
            ),
        ),
        1,
    )
# =========================================================
# STARTUP
# =========================================================

@app.on_event(
    "startup"
)
def startup_event():
    print(
        "Starting Face Register API..."
    )

    # Database session
    db = next(
        get_db()
    )

    try:
        rebuild_hnsw(
            db
        )

    finally:

        db.close()


# =========================================================
# ENROLL STUDENT
# =========================================================

@app.post(
    "/api/students/enroll"
)
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
        .filter(
            Student.student_id
            == student_id
        )
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

    image_bytes = (
        await photo.read()
    )

    if not image_bytes:

        raise HTTPException(
            status_code=422,
            detail="Empty image",
        )

    # -------------------------------------------------------
    # EXTRACT FACE
    # -------------------------------------------------------

    encoding, _ = (
        face_utils.extract_encoding(
            image_bytes
        )
    )

    if encoding is None:

        raise HTTPException(
            status_code=422,
            detail=(
                "No face detected "
                "in enrollment photo"
            ),
        )

    # Validate dimension
    try:

        encoding_to_numpy(
            encoding
        )

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

    with open(
        photo_path,
        "wb",
    ) as file:

        file.write(
            image_bytes
        )

    # -------------------------------------------------------
    # CREATE STUDENT
    # -------------------------------------------------------

    student = Student(
        student_id=student_id,
        name=name,
        course=course,
        photo_path=photo_path,
        encoding=(
            face_utils.encoding_to_json(
                encoding
            )
        ),
    )

    db.add(
        student
    )

    db.commit()

    db.refresh(
        student
    )
    try:

        create_notification(
            db=db,
            user_id=9,
            notification_type="STUDENT_CREATED",
            title="New Student Enrolled",
            message=(
                f"{student.name} "
                f"has been successfully enrolled."
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

        print(
            "Student notification failed:",
            error,
        )

    # -------------------------------------------------------
    # ADD TO HNSW
    # -------------------------------------------------------

    try:

        add_student_to_hnsw(
            student.id,
            encoding,
        )

        save_hnsw()

    except Exception as error:

        print(
            "HNSW add failed:",
            error,
        )

        # Student database mein reh sakta hai.
        # Next restart par rebuild ho jayega.

    # -------------------------------------------------------
    # RESPONSE
    # -------------------------------------------------------

    return {
        "message": "Student enrolled",
        "student_id": (
            student.student_id
        ),
        "database_id": (
            student.id
        ),
        "hnsw_indexed": (
            student.id
            in hnsw_student_to_label
        ),
    }


# =========================================================
# SEARCH STUDENT BY FACE
# =========================================================

@app.post(
    "/api/students/search"
)
async def search_face(
    frame: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    image_bytes = (
        await frame.read()
    )
    # -------------------------------------------------------
    # ANTI-SPOOFING
    # -------------------------------------------------------

    # liveness = verify_liveness(
    #     image_bytes
    # )

    # if not liveness["passed"]:

    #     raise HTTPException(
    #         status_code=403,
    #         detail={
    #             "message": "Spoof detected. Live face required.",
    #             "liveness": liveness["label"],
    #             "confidence": liveness["confidence"],
    #         },
    #     )


    # -------------------------------------------------------
    # FACE ENCODING
    # -------------------------------------------------------

    encoding, _ = (
        face_utils.extract_encoding(
            image_bytes
        )
    )

    if encoding is None:

        raise HTTPException(
            status_code=422,
            detail=(
                "No face detected "
                "in submitted frame"
            ),
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
            detail=(
                "No matching student found"
            ),
        )

    candidate_ids = [
        student_id
        for (
            student_id,
            _distance,
        ) in candidates
    ]

    # -------------------------------------------------------
    # EXACT VERIFICATION
    # -------------------------------------------------------

    match, distance = (
        exact_verify_candidates(
            encoding,
            candidate_ids,
            db,
        )
    )

    if match is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "No matching student found"
            ),
        )

    confidence = (
        face_distance_to_confidence(
            distance
        )
    )

    # -------------------------------------------------------
    # RESPONSE
    # -------------------------------------------------------

    return {

        "student_id":
            match.student_id,

        "name":
            match.name,

        "class":
            match.course,

        "status":
            match.status,

        "confidence":
            confidence,

        "accuracy":
            f"{confidence}%",

        "distance":
            round(
                float(distance),
                4,
            ),

        # "liveness":
        #     "real",

        # "liveness_confidence":
        #     liveness["confidence"],

        "image":
            (
                f"/media/students/"
                f"{os.path.basename(match.photo_path)}"
            ),
    }


# =========================================================
# MARK ATTENDANCE
# =========================================================

@app.post(
    "/api/students/attendance"
)
async def mark_attendance(
    frame: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    image_bytes = (
        await frame.read()
    )
    # -------------------------------------------------------
    # ANTI-SPOOFING
    # -------------------------------------------------------

    # liveness = verify_liveness(
    #     image_bytes
    # )

    # if not liveness["passed"]:

    #     raise HTTPException(
    #         status_code=403,
    #         detail={
    #             "message": "Spoof detected. Live face required.",
    #             "liveness": liveness["label"],
    #             "confidence": liveness["confidence"],
    #         },
    #     )

    # -------------------------------------------------------
    # EXTRACT FACE
    # -------------------------------------------------------

    encoding, _ = (
        face_utils.extract_encoding(
            image_bytes
        )
    )
    if encoding is None:
        raise HTTPException(
            status_code=422,
            detail="No face detected",
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
            detail=(
                "No matching student found"
            ),
        )
    candidate_ids = [
        student_id
        for (
            student_id,
            _distance,
        ) in candidates
    ]
    # -------------------------------------------------------
    # EXACT VERIFICATION
    # -------------------------------------------------------

    match, distance = (
        exact_verify_candidates(
            encoding,
            candidate_ids,
            db,
        )
    )
    if match is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "No matching student found"
            ),
        )

    # -------------------------------------------------------
    # CONFIDENCE
    # -------------------------------------------------------
    confidence = (
        face_distance_to_confidence(
            distance
        )
    )
    if confidence < ATTENDANCE_CONFIDENCE_THRESHOLD:
        raise HTTPException(
            status_code=403,
            detail={
                "message": "Face match confidence is below 80%. Attendance not marked.",
                "confidence": confidence,
                "required_confidence": ATTENDANCE_CONFIDENCE_THRESHOLD,
            },
        )

    today = (
        datetime.date.today()
    )
    # -------------------------------------------------------
    # TODAY ATTENDANCE
    # -------------------------------------------------------

    existing = (
        db.query(Attendance)
        .filter(
            Attendance.student_id
            == match.id,

            Attendance.date
            == today,
        )
        .first()
    )

    # -------------------------------------------------------
    # ALREADY PRESENT
    # -------------------------------------------------------

    if existing:

        status = (
            "Already Present"
        )

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

        db.add(
            attendance
        )

        db.commit()

        db.refresh(
            attendance
        )

        status = (
            "Present"
        )

    # -------------------------------------------------------
    # ATTENDANCE %
    # -------------------------------------------------------

    attendance_pct = (
        _attendance_percentage(
            db,
            match,
        )
    )

    # -------------------------------------------------------
    # RESPONSE
    # -------------------------------------------------------

    return {

            "id":
                match.student_id,

            "student_id":
                match.student_id,

            "name":
                match.name,

            "class":
                match.course,

            "status":
                status,

            "confidence":
                confidence,

            "accuracy":
                f"{confidence}%",

            "distance":
                round(
                    float(distance),
                    4,
                ),

            # # Anti-spoof information
            # "liveness":
            #     "real",

            # "liveness_confidence":
            #     liveness["confidence"],

            "attendance":
                f"{attendance_pct}%",

            "time":
                (
                    attendance.marked_at.isoformat()
                    if attendance.marked_at
                    else None
                ),

            "date":
                (
                    attendance.date.isoformat()
                    if attendance.date
                    else None
                ),

            "image":
                (
                    f"/media/students/"
                    f"{os.path.basename(match.photo_path)}"
                    if match.photo_path
                    else None
                ),
        }

# =========================================================
# ALL STUDENTS
# =========================================================

@app.get(
    "/api/students"
)
def list_students(
    db: Session = Depends(get_db),
):

    students = (
        db.query(Student)
        .all()
    )

    result = []

    for student in students:

        if not student.encoding:
            continue

        result.append({

            "id":
                student.student_id,

            "name":
                student.name,

            "class":
                student.course,

            "status":
                student.status,

            "image":
                (
                    f"/media/students/"
                    f"{os.path.basename(student.photo_path)}"
                )
                if student.photo_path
                else None,
        })

    return result


# =========================================================
# MARK ATTENDANCE ONCE TODAY
# =========================================================

def _mark_attendance_once_today(
    db: Session,
    student_id: int,
    confidence: float,
):

    today = (
        datetime.date.today()
    )

    already_marked = (
        db.query(Attendance)
        .filter(
            Attendance.student_id
            == student_id,

            Attendance.date
            == today,
        )
        .first()
    )

    if already_marked:

        return (
            already_marked,
            True,
        )

    attendance = Attendance(
        student_id=student_id,
        date=today,
        confidence=confidence,
    )

    db.add(
        attendance
    )

    db.commit()

    db.refresh(
        attendance
    )

    return (
        attendance,
        False,
    )


# =========================================================
# ATTENDANCE PERCENTAGE
# =========================================================

def _attendance_percentage(
    db: Session,
    student: Student,
) -> float:

    today = (
        datetime.date.today()
    )

    if not student.created_at:

        total_days = 1

    else:

        total_days = (
            today
            - student.created_at.date()
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
            Attendance.student_id
            == student.id
        )
        .scalar()
    ) or 0

    return round(
        min(
            (
                present_days
                /
                total_days
            )
            * 100,

            100,
        ),
        1,
    )


# =========================================================
# TODAY ATTENDANCE
# =========================================================

@app.get(
    "/api/attendance/today"
)
def get_today_attendance(
    db: Session = Depends(get_db),
):

    today = (
        datetime.date.today()
    )

    records = (
        db.query(
            Attendance,
            Student,
        )
        .join(
            Student,
            Attendance.student_id
            == Student.id,
        )
        .filter(
            Attendance.date
            == today
        )
        .order_by(
            Attendance.marked_at.desc(),
            Attendance.id.desc(),
        )
        .all()
    )

    result = []

    for (
        attendance,
        student,
    ) in records:

        attendance_percentage = (
            _attendance_percentage(
                db,
                student,
            )
        )

        confidence = (
            round(
                float(
                    attendance.confidence
                ),
                1,
            )
            if attendance.confidence
            is not None
            else None
        )

        result.append({

            "id":
                attendance.id,

            "student_id":
                student.student_id,

            "name":
                student.name,

            "class":
                student.course,

            "status":
                "Present",

            "date":
                (
                    attendance.date.isoformat()
                    if attendance.date
                    else None
                ),

            "time":
                (
                    attendance.marked_at.isoformat()
                    if attendance.marked_at
                    else None
                ),

            "marked_at":
                (
                    attendance.marked_at.isoformat()
                    if attendance.marked_at
                    else None
                ),

            "confidence":
                confidence,

            "accuracy":
                (
                    f"{confidence}%"
                    if confidence
                    is not None
                    else None
                ),

            "attendance":
                (
                    f"{attendance_percentage}%"
                ),

            "image":
                (
                    f"/media/students/"
                    f"{os.path.basename(student.photo_path)}"
                )
                if student.photo_path
                else None,
        })

    return result


# =========================================================
# HNSW STATUS
# =========================================================

@app.get(
    "/api/hnsw/status"
)
def hnsw_status():

    if hnsw_index is None:

        return {
            "ready": False,
            "count": 0,
            "max_elements":
                HNSW_MAX_ELEMENTS,
        }

    return {

        "ready":
            True,

        "count":
            hnsw_index.get_current_count(),

        "max_elements":
            hnsw_index.get_max_elements(),

        "dimension":
            FACE_EMBEDDING_DIM,

        "space":
            "cosine",

        "M":
            HNSW_M,

        "ef_construction":
            HNSW_EF_CONSTRUCTION,

        "ef":
            HNSW_EF,

        "top_k":
            HNSW_TOP_K,

        "distance_threshold":
            FACE_DISTANCE_THRESHOLD,
    }


# =========================================================
# MANUAL REBUILD
# =========================================================

@app.post(
    "/api/hnsw/rebuild"
)
def manual_rebuild(
    db: Session = Depends(get_db),
):

    try:

        rebuild_hnsw(
            db
        )

        return {

            "message":
                "HNSW rebuilt successfully",

            "count":
                hnsw_index.get_current_count()
                if hnsw_index   
                else 0,
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )
