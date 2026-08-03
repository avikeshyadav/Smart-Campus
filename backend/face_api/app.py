import os
import pickle
import uuid

import cv2
import face_recognition
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
ENCODING_FILE = "encodings/students.pkl"

os.makedirs("encodings", exist_ok=True)
os.makedirs("uploads", exist_ok=True)


def load_db():
    if os.path.exists(ENCODING_FILE):
        with open(ENCODING_FILE, "rb") as f:
            return pickle.load(f)
    return []


def save_db(data):
    with open(ENCODING_FILE, "wb") as f:
        pickle.dump(data, f)