# Face Recognition Attendance System

A working project scaffold implementing the architecture discussed:
React frontend (webcam + controlled-interval recognition), Node/Express
backend (auth, business logic, MySQL), and a stateless Python/FastAPI
computer-vision service (face detection, embeddings, comparison, basic
liveness).

```
attendance-system/
├── database/schema.sql        MySQL schema (users, students, faces, attendance, rules)
├── backend/                   Node + Express + JWT + MySQL
├── face-service/              Python + FastAPI + face_recognition + OpenCV
└── frontend/                  React (Vite) + webcam
```

## Architecture

```
React (webcam)
   ↓ controlled interval (~1 request/1.2s, not every rendered frame)
Node/Express  --- auth, roles, attendance rules, MySQL ---
   ↓ (multipart: image + candidate embeddings from MySQL)
Python/FastAPI --- face detection, embedding, liveness, comparison ---
   ↓ studentId + confidence
Node inserts attendance row in MySQL
```

The Python service is stateless: it never touches the database. Node
fetches embeddings from MySQL and passes them to Python for comparison,
keeping responsibilities cleanly split.

## 1. Database

```bash
mysql -u root -p < database/schema.sql
```

Then create your first admin user (there's no public signup — an admin
bootstraps other users via `/api/auth/register`). Easiest path: insert
directly once, then use the API afterward.

```sql
USE attendance_system;
INSERT INTO users (name, email, password_hash, role_id)
VALUES ('Admin', 'admin@example.com', '$2a$10$REPLACE_WITH_BCRYPT_HASH', 1);
```

Generate the bcrypt hash with:

```bash
node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"
```

## 2. Backend (Node)

```bash
cd backend
cp .env.example .env      # fill in your MySQL credentials + JWT secrets
npm install
npm run dev               # or: npm start
```

Runs on `http://localhost:5000`. Health check: `GET /health`.

Key endpoints:
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/students` (admin) — create a student record
- `POST /api/students/:id/enroll-face` (admin) — upload one face sample (call 5-10x per student, different poses)
- `POST /api/attendance/recognize` — upload one live frame, returns match + marks attendance
- `GET /api/attendance?date=&classId=&studentId=`

## 3. Face service (Python)

```bash
cd face-service
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt   # face-recognition needs cmake + dlib; on
                                  # Debian/Ubuntu: apt install cmake build-essential
uvicorn main:app --reload --port 8000
```

Runs on `http://localhost:8000`. Health check: `GET /health`.

⚠️ **Liveness note**: `face_utils.basic_liveness_check` is a simple
sharpness heuristic, only good enough to catch an obvious printed photo
or re-photographed screen. For real security against spoofing, replace
it with a trained anti-spoofing model and test it against your own
attack samples before trusting it for attendance integrity.

## 4. Frontend (React)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Opens on `http://localhost:5173`.
- `/login` — sign in
- `/dashboard/students/new` — create a student record (admin only) — note the returned numeric student ID
- `/dashboard/enrollment` — capture 5-10 face samples per student, using the numeric ID from above (not the roll number)
- `/dashboard/attendance` — live camera, controlled-interval recognition, shows Face / Confidence / Status

Typical flow: **log in as admin → Add Student → copy the returned student ID → Face Enrollment (5-10 samples) → Live Attendance.**

## Notes on the design choices carried over from the discussion

- **Not 30 requests/sec.** The attendance page fires a recognition
  request roughly every 1.2s while the camera itself keeps rendering at
  full frame rate — this matches the "browser detection → capture
  selected frame → recognition request" approach rather than streaming
  raw video to the server.
- **Status decided in the backend**, from `attendance_rules`
  (`present_start` / `present_end` / `late_end`), never in React.
- **One attendance row per student per day per class** is enforced with
  a unique key (`student_id`, `attendance_date`, `class_id`).
- **Roles**: admin / teacher / attendance_operator / student, enforced
  via `authorize(...)` middleware. Face enrollment is restricted to
  admin only.
- **Multiple samples per student** (5-10, varied pose/lighting) are
  stored in `student_faces`; recognition compares the live embedding
  against all of a student's stored embeddings via cosine similarity
  and takes the best score, gated by `FACE_MATCH_THRESHOLD`.
- Threshold-only matching is not enough for production: consider adding
  multi-frame confirmation (e.g. require the same student to win 3
  consecutive recognition calls before marking attendance) on top of
  this scaffold.
