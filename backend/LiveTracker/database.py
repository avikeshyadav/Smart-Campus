import datetime
from urllib.parse import quote_plus

import sqlalchemy as sa
from sqlalchemy.orm import declarative_base, sessionmaker
password = quote_plus("Avik@123")

# DATABASE_URL = "sqlite:///./face_register.db"
DATABASE_URL = f"mysql+pymysql://root:{password}@localhost:3306/mydb"
# connect_args={"check_same_thread": False}
engine = sa.create_engine(DATABASE_URL, )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

print(Base)
class Student(Base):
    __tablename__ = "students"

    # id = sa.Column(sa.String, primary_key=True, autoincrement=True)  # e.g. "STU-10245"
    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    student_id = sa.Column(sa.String, unique=True, nullable=False)
    name = sa.Column(sa.String, nullable=False)
    class_name = sa.Column(sa.String, nullable=False)
    photo_path = sa.Column(sa.String, nullable=False)
    encoding = sa.Column(sa.Text, nullable=False)  # JSON-encoded 128-d face vector
    status = sa.Column(sa.String, default="Active")
    created_at = sa.Column(sa.DateTime, default=datetime.datetime.utcnow)


class Attendance(Base):
    __tablename__ = "attendance"

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    student_id = sa.Column(sa.String, sa.ForeignKey("students.id"), nullable=False)
    date = sa.Column(sa.Date, default=datetime.date.today)
    marked_at = sa.Column(sa.DateTime, default=datetime.datetime.utcnow)
    confidence = sa.Column(sa.Float)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
