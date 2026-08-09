# Face Register API

FastAPI backend for the Face Verification Register frontend. Stores students
with a face encoding, matches a live camera frame against them, and logs
attendance once per day on a successful match.

## 1. Install

`face_recognition` depends on `dlib`, which needs a C++ build toolchain.

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get install -y cmake build-essential libopenblas-dev liblapack-dev
```

**macOS:**
```bash
brew install cmake
```

**Windows:** install "Desktop development with C++" from the Visual Studio
Build Tools first, or use conda: `conda install -c conda-forge dlib`.

Then, in a virtualenv:
```bash
cd backend
pip install -r requirements.txt
```

If dlib refuses to build and you just want to get moving, the easiest swap is
`deepface` instead of `face_recognition` (pip-installable everywhere, no
cmake) — ask and I'll port `face_utils.py` to it; it's slower per-request and
pulls in TensorFlow, which is the main tradeoff.

## 2. Run

```bash
uvicorn main:app --reload --port 5001
```

SQLite file `face_register.db` and a `media/students/` folder are created
automatically on first run.

## 3. Enroll a student

```bash
curl -X POST http://localhost:8000/api/students/enroll \
  -F "student_id=STU-10245" \
  -F "name=Rahul Sharma" \
  -F "class_name=10th A" \
  -F "photo=@rahul.jpg"
```

## 4. Search / verify a face

```bash
curl -X POST http://localhost:8000/api/students/search \
  -F "frame=@snapshot.jpg"
```

Response shape (matches the frontend's `student` state exactly):
```json
{
  "id": "STU-10245",
  "name": "Rahul Sharma",
  "class": "10th A",
  "status": "Active",
  "accuracy": "91.4%",
  "attendance": "94%",
  "image": "/media/students/STU-10245.jpg"
}
```

A 404 means no face matched closely enough (below `MATCH_THRESHOLD` in
`face_utils.py`, default 0.5 — lower it for stricter matching, raise it if
real students are getting rejected).

## 5. Wire it into the React frontend

The frontend currently fakes `searchFace()` with hardcoded data. Replace it
with a canvas capture + fetch call:

```jsx
const captureFrame = () => {
  const video = videoRef.current;  
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
};

const searchFace = async () => {
  const blob = await captureFrame();
  const formData = new FormData();
  formData.append("frame", blob, "frame.jpg");

  try {
    const res = await fetch("http://localhost:8000/api/students/search", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      setStudent(null); // or show "no match" state
      return;
    }
    const data = await res.json();
    setStudent({ ...data, image: `http://localhost:8000${data.image}` });
  } catch (err) {
    console.log(err);
  }
};
```

## Notes / things worth knowing before this goes near production

- `accuracy` is a rough distance→percentage conversion for display, not a
  calibrated confidence score — don't use it for anything that needs real
  statistical meaning.
- Matching is O(n) against every enrolled student per request. Fine for a
  school of a few hundred; for thousands, look at a vector index (FAISS,
  pgvector) instead of the linear scan in `face_utils.best_match`.
- CORS is wide open (`allow_origins=["*"]`) for local dev — lock this down
  before deploying.
- No auth on any endpoint yet — anyone who can reach the API can enroll or
  query student faces. Add an auth layer before this touches real student
  data; biometric data is sensitive.
