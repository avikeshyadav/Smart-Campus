-- ============================================================
-- Face Recognition Attendance System - Database Schema
-- MySQL 8+
-- ============================================================

CREATE DATABASE IF NOT EXISTS attendance_system
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE attendance_system;

-- ------------------------------------------------------------
-- Roles & Users (auth)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE   -- admin, teacher, attendance_operator, student
);

INSERT IGNORE INTO roles (id, name) VALUES
  (1, 'admin'),
  (2, 'teacher'),
  (3, 'attendance_operator'),
  (4, 'student');

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  refresh_token VARCHAR(512) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ------------------------------------------------------------
-- Classes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,          -- e.g. "10-A"
  teacher_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- ------------------------------------------------------------
-- Students
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) DEFAULT NULL,
  roll_number VARCHAR(50) NOT NULL,
  class_id INT DEFAULT NULL,
  user_id INT DEFAULT NULL,            -- optional: link to a login account
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_roll_per_class (class_id, roll_number),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ------------------------------------------------------------
-- Face embeddings (multiple samples per student)
-- embedding stored as JSON array of floats (128-d / 512-d vector
-- depending on the model used by the face-service)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_faces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  embedding JSON NOT NULL,
  sample_label VARCHAR(50) DEFAULT NULL,  -- e.g. "front", "left", "with_glasses"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_student_faces_student (student_id)
);

-- ------------------------------------------------------------
-- Attendance
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  class_id INT DEFAULT NULL,
  attendance_date DATE NOT NULL,
  check_in_time DATETIME NOT NULL,
  status ENUM('present', 'late', 'absent') NOT NULL DEFAULT 'present',
  confidence FLOAT DEFAULT NULL,        -- recognition confidence score
  marked_by INT DEFAULT NULL,           -- user id (teacher/operator) or NULL if auto
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (marked_by) REFERENCES users(id),
  UNIQUE KEY unique_daily_attendance (student_id, attendance_date, class_id)
);

-- ------------------------------------------------------------
-- Attendance rules (configurable, backend decides status from these)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT DEFAULT NULL,           -- NULL = global default rule
  present_start TIME NOT NULL DEFAULT '08:00:00',
  present_end   TIME NOT NULL DEFAULT '10:00:00',
  late_end      TIME NOT NULL DEFAULT '10:30:00',
  FOREIGN KEY (class_id) REFERENCES classes(id)
);

INSERT IGNORE INTO attendance_rules (id, class_id, present_start, present_end, late_end)
VALUES (1, NULL, '08:00:00', '10:00:00', '10:30:00');
