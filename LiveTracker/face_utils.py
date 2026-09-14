
import json
import threading

import cv2
import numpy as np
from insightface.app import FaceAnalysis
# =========================================================
# MODEL
# =========================================================

MODEL_NAME = "buffalo_l"
PROVIDERS = ["CPUExecutionProvider"]

EMBEDDING_DIM = 512


# =========================================================
# QUALITY CONFIG
# =========================================================

MIN_FACE_SIZE = 40
MIN_BLUR_SCORE = 30.0
MIN_BRIGHTNESS = 35.0
MAX_BRIGHTNESS = 225.0
MIN_DETECTION_SCORE = 0.40

# Pose limits
MAX_ABS_YAW = 35.0
MAX_ABS_PITCH = 30.0


# =========================================================
# MATCHING CONFIG
# =========================================================

DEFAULT_MATCH_THRESHOLD = 0.50
DEFAULT_MARGIN_THRESHOLD = 0.05


# =========================================================
# GLOBALS
# =========================================================

_model = None
_model_lock = threading.Lock()
_last_quality_info = None
_last_match_info = None


# =========================================================
# MODEL LOADER
# =========================================================

def get_model():
    global _model

    if _model is not None:
        return _model

    with _model_lock:
        if _model is None:

            print("\n" + "=" * 70)
            print("🚀 LOADING INSIGHTFACE MODEL")
            print("=" * 70)
            print(f"Model     : {MODEL_NAME}")
            print(f"Providers : {PROVIDERS}")
            print(f"Embedding : {EMBEDDING_DIM}-D")
            print("=" * 70)

            _model = FaceAnalysis(
                name=MODEL_NAME,
                providers=PROVIDERS,
            )

            _model.prepare(
                ctx_id=0,
                det_size=(640, 640),
            )

            print("✅ INSIGHTFACE MODEL READY")
            print("=" * 70 + "\n")

    return _model


# =========================================================
# IMAGE DECODER
# =========================================================

def decode_image(image_bytes: bytes):

    if not image_bytes:
        raise ValueError("Empty image")

    try:

        array = np.frombuffer(
            image_bytes,
            dtype=np.uint8,
        )

        image = cv2.imdecode(
            array,
            cv2.IMREAD_COLOR,
        )

    except Exception as error:

        raise ValueError(
            f"Invalid image: {error}"
        )

    if image is None:
        raise ValueError(
            "Unable to decode image"
        )

    return image


# =========================================================
# QUALITY METRICS
# =========================================================

def calculate_blur_score(image, bbox=None):
    """
    Variance of Laplacian.

    Higher generally means sharper.
    """

    if bbox is not None:

        x1, y1, x2, y2 = [
            int(v) for v in bbox
        ]

        h, w = image.shape[:2]

        x1 = max(0, min(x1, w - 1))
        x2 = max(0, min(x2, w))

        y1 = max(0, min(y1, h - 1))
        y2 = max(0, min(y2, h))

        if x2 > x1 and y2 > y1:
            image = image[
                y1:y2,
                x1:x2
            ]

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )

    return float(
        cv2.Laplacian(
            gray,
            cv2.CV_64F,
        ).var()
    )


def calculate_brightness(image, bbox=None):

    if bbox is not None:

        x1, y1, x2, y2 = [
            int(v) for v in bbox
        ]

        h, w = image.shape[:2]

        x1 = max(0, min(x1, w - 1))
        x2 = max(0, min(x2, w))

        y1 = max(0, min(y1, h - 1))
        y2 = max(0, min(y2, h))

        if x2 > x1 and y2 > y1:
            image = image[
                y1:y2,
                x1:x2
            ]

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )

    return float(
        np.mean(gray)
    )


def _bbox_size(bbox):

    x1, y1, x2, y2 = [
        float(v) for v in bbox
    ]

    width = max(
        0.0,
        x2 - x1
    )

    height = max(
        0.0,
        y2 - y1
    )

    return width, height


# =========================================================
# POSE
# =========================================================

def _get_pose(face):
    """
    InsightFace versions expose pose
    as different attributes.

    Returns:
        yaw, pitch, roll
    """

    yaw = None
    pitch = None
    roll = None

    try:

        pose = getattr(
            face,
            "pose",
            None,
        )

        if pose is not None:

            pose = np.asarray(
                pose,
                dtype=np.float32,
            ).reshape(-1)

            if pose.size >= 3:

                # Common InsightFace convention:
                # pitch, yaw, roll

                pitch = float(
                    pose[0]
                )

                yaw = float(
                    pose[1]
                )

                roll = float(
                    pose[2]
                )

    except Exception:
        pass

    return (
        yaw,
        pitch,
        roll,
    )


# =========================================================
# FACE QUALITY
# =========================================================

def calculate_face_quality(
    image,
    face,
):

    bbox = np.asarray(
        face.bbox,
        dtype=np.float32,
    )

    width, height = _bbox_size(
        bbox
    )

    face_size = min(
        width,
        height,
    )

    det_score = float(
        getattr(
            face,
            "det_score",
            0.0,
        )
    )

    blur_score = calculate_blur_score(
        image,
        bbox,
    )

    brightness = calculate_brightness(
        image,
        bbox,
    )

    yaw, pitch, roll = _get_pose(
        face
    )

    checks = {

        "face_size_ok":
            face_size >= MIN_FACE_SIZE,

        "blur_ok":
            blur_score >= MIN_BLUR_SCORE,

        "brightness_ok":
            MIN_BRIGHTNESS
            <= brightness
            <= MAX_BRIGHTNESS,

        "detection_ok":
            det_score >= MIN_DETECTION_SCORE,
    }

    # Pose only checked if available

    if yaw is not None:

        checks["yaw_ok"] = (
            abs(yaw)
            <= MAX_ABS_YAW
        )

    if pitch is not None:

        checks["pitch_ok"] = (
            abs(pitch)
            <= MAX_ABS_PITCH
        )

    quality = {

        "face_width":
            round(width, 1),

        "face_height":
            round(height, 1),

        "face_size":
            round(face_size, 1),

        "blur_score":
            round(blur_score, 2),

        "brightness":
            round(brightness, 2),

        "detection_score":
            round(det_score, 4),

        "yaw":
            (
                round(yaw, 2)
                if yaw is not None
                else None
            ),

        "pitch":
            (
                round(pitch, 2)
                if pitch is not None
                else None
            ),

        "roll":
            (
                round(roll, 2)
                if roll is not None
                else None
            ),

        "checks":
            checks,
    }

    return quality


# =========================================================
# QUALITY DEBUG / ERROR
# =========================================================

def _quality_error(quality):

    checks = quality["checks"]

    print("\n" + "=" * 70)
    print("🔍 FACE QUALITY DEBUG")
    print("=" * 70)

    print(
        f"Face Width       : "
        f"{quality['face_width']} px"
    )

    print(
        f"Face Height      : "
        f"{quality['face_height']} px"
    )

    print(
        f"Face Size        : "
        f"{quality['face_size']} px"
    )

    print(
        f"Blur Score       : "
        f"{quality['blur_score']}"
    )

    print(
        f"Brightness       : "
        f"{quality['brightness']}"
    )

    print(
        f"Detection Score  : "
        f"{quality['detection_score']}"
    )

    print(
        f"Yaw              : "
        f"{quality['yaw']}"
    )

    print(
        f"Pitch            : "
        f"{quality['pitch']}"
    )

    print(
        f"Roll             : "
        f"{quality['roll']}"
    )

    print("-" * 70)
    print("QUALITY CHECKS")
    print("-" * 70)

    for name, passed in checks.items():
        status = (
            "✅ PASS"
            if passed
            else
            "❌ FAIL"
        )

        print(
            f"{status:10} {name}"
        )

    print("-" * 70)

    failed = [
        name
        for name, passed in checks.items()
        if not passed
    ]

    if not failed:

        print(
            "✅ ALL FACE QUALITY "
            "CHECKS PASSED"
        )

        print("=" * 70 + "\n")

        return None

    print(
        "❌ QUALITY CHECK FAILED"
    )

    print(
        "Failed checks:",
        ", ".join(failed)
    )

    print("=" * 70 + "\n")

    # Detection

    if not checks.get(
        "detection_ok",
        False,
    ):

        return (
            "Face detection confidence "
            f"too low "
            f"({quality['detection_score']:.2f})."
        )

    # Face size

    if not checks.get(
        "face_size_ok",
        False,
    ):

        return (
            f"Face is too small "
            f"({quality['face_size']:.1f}px). "
            f"Minimum required: "
            f"{MIN_FACE_SIZE}px."
        )

    # Blur

    if not checks.get(
        "blur_ok",
        False,
    ):

        return (
            f"Image is too blurry "
            f"(blur score: "
            f"{quality['blur_score']:.2f}). "
            f"Minimum required: "
            f"{MIN_BLUR_SCORE}."
        )

    # Brightness

    if not checks.get(
        "brightness_ok",
        False,
    ):

        if quality["brightness"] < MIN_BRIGHTNESS:

            return (
                f"Face image is too dark "
                f"(brightness: "
                f"{quality['brightness']:.1f}). "
                f"Minimum: "
                f"{MIN_BRIGHTNESS}."
            )

        return (
            f"Face image is too bright "
            f"(brightness: "
            f"{quality['brightness']:.1f}). "
            f"Maximum: "
            f"{MAX_BRIGHTNESS}."
        )

    # Yaw

    if (
        "yaw_ok" in checks
        and not checks["yaw_ok"]
    ):
        return (f"Face yaw angle is too large " f"({quality['yaw']:.1f}°). ""Look directly at the camera.")

    # Pitch
    if (
        "pitch_ok" in checks
        and not checks["pitch_ok"]
    ):
        return (
            f"Face pitch angle is too large "
            f"({quality['pitch']:.1f}°). "
            "Look directly at the camera."
        )

    return ("Face quality failed: " + ", ".join(failed))

# =========================================================
# FACE EXTRACTION
# =========================================================

def extract_encoding(
    image_bytes: bytes,
    require_quality: bool = True,
):
    """
    Returns:

        (
            normalized_512d_embedding,
            face_location
        )

    Raises ValueError when:

        - image invalid
        - no face
        - multiple faces
        - quality insufficient
        - embedding invalid
    """
    global _last_quality_info
    image = decode_image(
        image_bytes
    )

    model = get_model()
    try:
        faces = model.get(image)

    except Exception as error:
        raise ValueError(f"Face detection failed: "f"{error}")

    # No face

    if not faces:
        raise ValueError("No face detected.")
    # Multiple faces
    # if len(faces) > 1:
    #     raise ValueError("Multiple faces detected. " "Only one face should be visible." )
    face = faces[0]
    # -----------------------------------------------------
    # QUALITY
    # -----------------------------------------------------

    quality = calculate_face_quality(
        image,
        face,
    )

    _last_quality_info = quality

    if require_quality:
        error_message = _quality_error(
            quality
        )

        if error_message:

            raise ValueError(
                error_message
            )

    # -----------------------------------------------------
    # EMBEDDING
    # -----------------------------------------------------

    embedding = getattr(
        face,
        "embedding",
        None,
    )

    if embedding is None:

        raise ValueError(
            "Face embedding was not generated."
        )

    embedding = np.asarray(
        embedding,
        dtype=np.float32,
    ).reshape(-1)

    print("\n" + "-" * 70)
    print("🧠 ARC FACE EMBEDDING DEBUG")
    print("-" * 70)

    print(
        "Embedding shape :",
        embedding.shape
    )

    print(
        "Embedding size  :",
        embedding.size
    )

    print(
        "Embedding dtype :",
        embedding.dtype
    )

    if embedding.size > 0:

        print(
            "First 5 values  :",
            embedding[:5]
        )

    print("-" * 70)

    # Dimension

    if embedding.size != EMBEDDING_DIM:

        raise ValueError(
            "Invalid ArcFace embedding "
            f"dimension: {embedding.size}. "
            f"Expected {EMBEDDING_DIM}."
        )

    # NaN / Infinity

    if not np.all(
        np.isfinite(embedding)
    ):

        raise ValueError(
            "Face embedding contains "
            "invalid values."
        )

    # Normalize

    norm = np.linalg.norm(
        embedding
    )

    if norm <= 0:

        raise ValueError(
            "Invalid zero face embedding."
        )

    embedding = (
        embedding / norm
    ).astype(
        np.float32
    )

    # Verify normalization

    normalized_norm = np.linalg.norm(
        embedding
    )

    print(
        f"Normalized norm : "
        f"{normalized_norm:.6f}"
    )

    print(
        "✅ 512-D ArcFace embedding ready"
    )

    print("-" * 70 + "\n")

    # Face location

    bbox = np.asarray(
        face.bbox,
        dtype=np.float32,
    ).tolist()

    return (
        embedding,
        bbox,
    )


# =========================================================
# LAST QUALITY
# =========================================================

def get_last_quality_info():

    return _last_quality_info


# =========================================================
# JSON HELPERS
# =========================================================

def encoding_to_json(
    encoding
):

    vector = np.asarray(
        encoding,
        dtype=np.float32,
    ).reshape(-1)

    if vector.size != EMBEDDING_DIM:

        raise ValueError(
            f"Invalid embedding dimension: "
            f"{vector.size}. "
            f"Expected {EMBEDDING_DIM}."
        )

    return json.dumps(
        vector.tolist(),
        separators=(
            ",",
            ":",
        ),
    )


def json_to_encoding(
    data
):

    if data is None:
        return None

    if isinstance(
        data,
        str,
    ):

        data = json.loads(
            data
        )

    vector = np.asarray(
        data,
        dtype=np.float32,
    ).reshape(-1)

    if vector.size != EMBEDDING_DIM:

        raise ValueError(
            f"Invalid embedding dimension: "
            f"{vector.size}. "
            f"Expected {EMBEDDING_DIM}."
        )

    # Normalize loaded vector too

    norm = np.linalg.norm(
        vector
    )

    if norm <= 0:

        raise ValueError(
            "Zero embedding."
        )

    vector = (
        vector / norm
    ).astype(
        np.float32
    )

    return vector


# =========================================================
# COSINE SIMILARITY
# =========================================================

def cosine_similarity(
    a,
    b,
):

    a = np.asarray(
        a,
        dtype=np.float32,
    ).reshape(-1)

    b = np.asarray(
        b,
        dtype=np.float32,
    ).reshape(-1)

    if (
        a.size != EMBEDDING_DIM
        or b.size != EMBEDDING_DIM
    ):

        raise ValueError(
            "Invalid embedding dimension."
        )

    a_norm = np.linalg.norm(
        a
    )

    b_norm = np.linalg.norm(
        b
    )

    if (
        a_norm <= 0
        or b_norm <= 0
    ):

        raise ValueError(
            "Zero embedding."
        )

    return float(
        np.dot(
            a / a_norm,
            b / b_norm,
        )
    )


# =========================================================
# UI SCORE
# =========================================================

def similarity_to_confidence(
    similarity
):
    """
    UI score only.

    NOT probability.
    """

    if similarity is None:
        return 0.0

    low = 0.50
    high = 0.75

    score = (
        (
            float(similarity)
            - low
        )
        /
        (
            high - low
        )
    ) * 100.0

    return round(
        max(
            0.0,
            min(
                100.0,
                score,
            ),
        ),
        1,
    )


# =========================================================
# MATCH DEBUG
# =========================================================

def _print_match_debug(
    scored,
    best_similarity,
    best_identifier,
    second_similarity,
    margin,
    threshold,
    margin_threshold,
    accepted,
    reason,
):

    print("\n" + "=" * 70)
    print("🔍 ARC FACE MATCH DEBUG")
    print("=" * 70)

    print(
        f"Candidates       : {len(scored)}"
    )

    print(
        f"Best Student     : {best_identifier}"
    )

    print(
        f"Best Similarity  : "
        f"{best_similarity:.6f}"
    )

    if second_similarity is not None:

        print(
            f"2nd Similarity   : "
            f"{second_similarity:.6f}"
        )

    else:

        print(
            "2nd Similarity   : N/A"
        )

    print(
        f"Margin           : "
        f"{margin:.6f}"
    )

    print("-" * 70)

    print(
        f"Match Threshold  : "
        f"{threshold:.6f}"
    )

    print(
        f"Margin Threshold : "
        f"{margin_threshold:.6f}"
    )

    print("-" * 70)

    # Individual checks

    similarity_pass = (
        best_similarity
        >= threshold
    )

    margin_pass = (
        len(scored) <= 1
        or margin >= margin_threshold
    )

    print(
        "Similarity Check : "
        + (
            "✅ PASS"
            if similarity_pass
            else
            "❌ FAIL"
        )
    )

    print(
        "Margin Check     : "
        + (
            "✅ PASS"
            if margin_pass
            else
            "❌ FAIL"
        )
    )

    print("-" * 70)

    if accepted:

        print(
            "✅ MATCH ACCEPTED"
        )

        print(
            f"Reason           : {reason}"
        )

    else:

        print(
            "❌ MATCH REJECTED"
        )

        print(
            f"Reason           : {reason}"
        )

    print("=" * 70 + "\n")


# =========================================================
# BEST MATCH
# =========================================================

def best_match(
    query_encoding,
    known_encodings,
    threshold=DEFAULT_MATCH_THRESHOLD,
    margin_threshold=DEFAULT_MARGIN_THRESHOLD,
):
    """
    Find the best face match.

    Returns:

        (
            identifier,
            best_similarity,
            margin
        )

    If rejected:

        (
            None,
            best_similarity,
            margin
        )

    Matching requires:

        similarity >= threshold

    AND, when multiple candidates exist:

        margin >= margin_threshold
    """

    global _last_match_info

    query = np.asarray(
        query_encoding,
        dtype=np.float32,
    ).reshape(-1)

    # -----------------------------------------------------
    # QUERY VALIDATION
    # -----------------------------------------------------

    if query.size != EMBEDDING_DIM:

        raise ValueError(
            f"Invalid query embedding "
            f"dimension: {query.size}. "
            f"Expected {EMBEDDING_DIM}."
        )

    query_norm = np.linalg.norm(
        query
    )

    if query_norm <= 0:

        raise ValueError(
            "Query embedding is zero."
        )

    # Normalize query once

    query = (
        query / query_norm
    ).astype(
        np.float32
    )

    # -----------------------------------------------------
    # SCORE ALL CANDIDATES
    # -----------------------------------------------------

    scored = []

    for identifier, encoding in known_encodings:

        try:

            similarity = cosine_similarity(
                query,
                encoding,
            )

            scored.append(
                (
                    similarity,
                    identifier,
                )
            )

        except Exception as error:

            print(
                f"⚠️ Skipping invalid "
                f"embedding for "
                f"{identifier}: {error}"
            )

            continue

    # -----------------------------------------------------
    # NO CANDIDATES
    # -----------------------------------------------------

    if not scored:

        print("\n" + "=" * 70)
        print("❌ FACE MATCH FAILED")
        print("=" * 70)
        print(
            "Reason: No valid face "
            "embeddings available."
        )
        print("=" * 70 + "\n")

        _last_match_info = {
            "accepted": False,
            "reason": "no_candidates",
            "best_similarity": None,
            "second_similarity": None,
            "margin": None,
            "threshold": threshold,
            "margin_threshold": margin_threshold,
        }

        return (
            None,
            None,
            None,
        )

    # -----------------------------------------------------
    # SORT
    # -----------------------------------------------------

    scored.sort(
        key=lambda item: item[0],
        reverse=True,
    )

    # -----------------------------------------------------
    # BEST
    # -----------------------------------------------------

    best_similarity, best_identifier = (
        scored[0]
    )

    # -----------------------------------------------------
    # SECOND BEST
    # -----------------------------------------------------

    if len(scored) > 1:

        second_similarity = (
            scored[1][0]
        )

        margin = (
            best_similarity
            - second_similarity
        )

    else:

        second_similarity = None

        # With only one candidate,
        # use best similarity as margin.

        margin = best_similarity

    # -----------------------------------------------------
    # DECISION
    # -----------------------------------------------------

    similarity_pass = (
        best_similarity
        >= threshold
    )

    margin_pass = (
        len(scored) <= 1
        or margin >= margin_threshold
    )

    accepted = (
        similarity_pass
        and margin_pass
    )

    # -----------------------------------------------------
    # REASON
    # -----------------------------------------------------

    if not similarity_pass:

        reason = (
            "Best similarity is below "
            "the required threshold."
        )

    elif not margin_pass:

        reason = (
            "Best and second-best "
            "matches are too close."
        )

    else:

        reason = (
            "Similarity and margin "
            "requirements passed."
        )

    # -----------------------------------------------------
    # DEBUG
    # -----------------------------------------------------

    _print_match_debug(
        scored=scored,
        best_similarity=best_similarity,
        best_identifier=best_identifier,
        second_similarity=second_similarity,
        margin=margin,
        threshold=threshold,
        margin_threshold=margin_threshold,
        accepted=accepted,
        reason=reason,
    )

    # -----------------------------------------------------
    # STORE DEBUG INFO
    # -----------------------------------------------------

    _last_match_info = {

        "accepted":
            accepted,

        "reason":
            reason,

        "best_identifier":
            best_identifier,

        "best_similarity":
            round(
                float(best_similarity),
                6,
            ),

        "second_similarity":
            (
                round(
                    float(
                        second_similarity
                    ),
                    6,
                )
                if second_similarity is not None
                else None
            ),

        "margin":
            round(
                float(margin),
                6,
            ),

        "threshold":
            float(threshold),

        "margin_threshold":
            float(margin_threshold),

        "candidate_count":
            len(scored),
    }

    # -----------------------------------------------------
    # REJECT
    # -----------------------------------------------------

    if not accepted:

        return (
            None,
            best_similarity,
            margin,
        )

    # -----------------------------------------------------
    # ACCEPT
    # -----------------------------------------------------

    return (
        best_identifier,
        best_similarity,
        margin,
    )


# =========================================================
# LAST MATCH INFO
# =========================================================

def get_last_match_info():

    return _last_match_info