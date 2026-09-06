import datetime
from urllib.parse import quote_plus
import sqlalchemy as sa
from sqlalchemy import text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
# =========================================================
# DATABASE CONFIG
# =========================================================

password = quote_plus("Avik@123")

# DATABASE_URL = "sqlite:///./face_register.db"

DATABASE_URL = (
    f"mysql+pymysql://root:{password}"
    f"@localhost:3306/mydb"
)

engine = sa.create_engine(
    DATABASE_URL,
    connect_args={
        "init_command": "SET time_zone = '+05:30'"
    }
)
SessionLocal = sessionmaker(autocommit=False,autoflush=False,bind=engine,)
Base = declarative_base()
# =========================================================
# INDIA TIME
# =========================================================

def india_now():
    return datetime.datetime.now(
        datetime.timezone(
            datetime.timedelta(
                hours=5,
                minutes=30,
            )
        )
    ).replace(
        tzinfo=None
    )
# =========================================================
# STUDENT
# =========================================================

class Student(Base):
    __tablename__ = "students"
    id = sa.Column(sa.Integer, primary_key=True,autoincrement=True,)
    student_id = sa.Column( sa.String, unique=True, nullable=False,)
    name = sa.Column(sa.String,nullable=False,)
    course = sa.Column(sa.String,nullable=False,)
    photo_path = sa.Column(sa.String,nullable=False,)
    # avatar_url = sa.Column(
    #     sa.Text, 
    #     nullable=True)
    encoding = sa.Column(sa.Text,nullable=False,)
    status = sa.Column(sa.String,default="Active",)
    created_at = sa.Column(sa.DateTime,default=india_now,)
# =========================================================
# ATTENDANCE
# =========================================================

class Attendance(Base):
    __tablename__ = "attendance"
    id = sa.Column(sa.Integer,primary_key=True,autoincrement=True,)
    student_id = sa.Column(sa.String,sa.ForeignKey("students.id"),nullable=False,)
    date = sa.Column(sa.Date,default=datetime.date.today,)
    marked_at = sa.Column(sa.DateTime,default=india_now,)
    confidence = sa.Column(sa.Float,)
# =========================================================
# NOTIFICATIONS
# =========================================================

class Notification(Base):
    __tablename__ = "notifications"
    id = sa.Column(sa.Integer,primary_key=True,autoincrement=True,)
    user_id = sa.Column(sa.Integer,nullable=False,index=True,)
    type = sa.Column(sa.String(100),nullable=False,)
    title = sa.Column(sa.String(255),nullable=False,)
    message = sa.Column(sa.Text,nullable=False,)
    entity_type = sa.Column(sa.String(100),nullable=True,)
    entity_id = sa.Column(sa.Integer,nullable=True,)
    notification_metadata = sa.Column("metadata",sa.JSON,nullable=True,)
    is_read = sa.Column(sa.Boolean,default=False,nullable=False,)
    created_at = sa.Column(sa.DateTime,default=india_now,nullable=False,)
    expires_at = sa.Column(sa.DateTime,nullable=False,)


# =========================================================
# CREATE TABLES
# =========================================================
Base.metadata.create_all(bind=engine)
# =========================================================
# DATABASE SESSION
# =========================================================

def get_db():
    db = SessionLocal()
    try:
        yield db

    finally:
        db.close()

def get_student_hostel_details(
    db: Session,
    student_db_id: int,
):
    sql = text("""
        SELECT
            a.allocation_date,
            a.status AS allocation_status,
            a.remarks,
            h.name AS hostel_name,
            h.code AS hostel_code,
            h.hostel_type,

            f.id AS floor_id,
            f.floor_name,

            r.id AS room_id,
            r.room_type,
            r.room_number,

            b.id AS bed_id,
            b.bed_number,
            b.status AS bed_status

        FROM hostel_allocations a

        INNER JOIN hostel_rooms r
            ON r.id = a.room_id

        INNER JOIN hostel_floors f
            ON f.id = r.floor_id

        INNER JOIN hostels h
            ON h.id = f.hostel_id

        INNER JOIN hostel_beds b
            ON b.id = a.bed_id

        WHERE a.student_id = :student_id
          AND a.status = 'Active'

        LIMIT 1
    """)

    row = db.execute(
        sql,
        {
            "student_id": student_db_id
        }
    ).mappings().first()

    if not row:
        return None

    return dict(row)
