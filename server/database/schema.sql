-- =========================================================================================
-- CAMPUSCONNECT: RELATIONAL DATABASE MANAGEMENT SYSTEM (RDBMS) SCHEMA
-- =========================================================================================
-- Laboratory Course Reference:
--   - 24INMCAL391: RDBMS Lab (Database Design, Normalization, DDL & Referential Actions)
--   - 24INMCAT307: Software Engineering (Relational Data Modeling & Integrity Guarantees)
--
-- Target Database Engine: MariaDB 10.4+ / MySQL 8.0+ (Default XAMPP Stack, Port 3306)
-- Database Name: student_management_db
--
-- Normalization Rationale:
--   1. 1NF (First Normal Form): Every column contains atomic scalar values; primary keys enforced.
--   2. 2NF (Second Normal Form): Composite dependencies resolved via junction entities (class_subjects).
--   3. 3NF (Third Normal Form): Transitive dependencies eliminated (e.g., student and teacher 
--      credentials reside strictly in 'users' rather than duplicated across domain tables).
--
-- Referential Actions Implemented:
--   - ON DELETE CASCADE: Deleting a parent user or student automatically cleans child records.
--   - ON DELETE SET NULL: Disbanding a class or unlinking a parent sets foreign keys to NULL.
--   - UNIQUE KEY `unique_student_date`: Composite unique index enabling atomic bulk upserts.
-- =========================================================================================

-- 1. Database Initialization
CREATE DATABASE IF NOT EXISTS `student_management_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `student_management_db`;

-- -----------------------------------------------------------------------------------------
-- TABLE 1: users (Master System Authentication & User Biodata)
-- -----------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `login_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique system identifier for login (e.g., admin, TCH101, STD201)',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Bcrypt cryptographic hash with salt factor 10',
  `role` ENUM('admin', 'teacher', 'student', 'parent') NOT NULL COMMENT 'Role-based access control domain',
  `name` VARCHAR(100) NOT NULL COMMENT 'Legal full name',
  `email` VARCHAR(100),
  `phone` VARCHAR(20),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------------------
-- TABLE 2: classes (Academic Standards & Grade Divisions)
-- -----------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_name` VARCHAR(50) NOT NULL COMMENT 'Grade level (e.g., Grade 10, MCA Sem 3)',
  `section` VARCHAR(10) NOT NULL COMMENT 'Class division / section (e.g., A, B, C)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------------------
-- TABLE 3: teachers (Faculty Profiles & Departmental Allocations)
-- -----------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT 'FK to master credentials in users table',
  `employee_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique staff identification code',
  `department` VARCHAR(100) COMMENT 'Academic department (e.g., Computer Science, Mathematics)',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------------------
-- TABLE 4: parents (Guardian / Parent Records)
-- -----------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `parents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT 'FK to master credentials in users table',
  `occupation` VARCHAR(100) COMMENT 'Guardian occupation',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------------------
-- TABLE 5: students (Enrolled Student Profiles & Relational Links)
-- -----------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT 'FK to master credentials in users table',
  `roll_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique institutional roll number',
  `class_id` INT COMMENT 'Assigned class standard',
  `parent_id` INT COMMENT 'Linked guardian profile',
  `dob` DATE COMMENT 'Date of birth',
  `address` TEXT COMMENT 'Postal residential address',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------------------
-- TABLE 6: subjects (Academic Curriculum Catalog)
-- -----------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subject_name` VARCHAR(100) NOT NULL COMMENT 'Course title (e.g., Database Management Systems)',
  `subject_code` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Course identifier (e.g., 24INMCAL391)'
);

-- -----------------------------------------------------------------------------------------
-- TABLE 7: class_subjects (Associative Junction Table: Class <-> Subject <-> Teacher)
-- -----------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `class_subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `teacher_id` INT NOT NULL,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------------------
-- TABLE 8: attendance (Daily Student Attendance with Composite Unique Index)
-- -----------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `class_id` INT NOT NULL,
  `date` DATE NOT NULL COMMENT 'Attendance calendar date (YYYY-MM-DD)',
  `status` ENUM('Present', 'Absent', 'Late') NOT NULL DEFAULT 'Present',
  `remarks` VARCHAR(255) COMMENT 'Optional teacher observation',
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  -- Composite Unique Constraint: Guarantees exactly one attendance record per student per day,
  -- enabling atomic upserts via MySQL's ON DUPLICATE KEY UPDATE clause
  UNIQUE KEY `unique_student_date` (`student_id`, `date`)
);

-- -----------------------------------------------------------------------------------------
-- TABLE 9: marks (Examination Score Records)
-- -----------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `marks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `exam_type` VARCHAR(50) NOT NULL COMMENT 'Assessment name (e.g., Unit Test 1, Midterm, Final Exam)',
  `marks_obtained` DECIMAL(5,2) NOT NULL COMMENT 'Score scored by student',
  `max_marks` DECIMAL(5,2) NOT NULL DEFAULT 100.00 COMMENT 'Maximum attainable score',
  `remarks` VARCHAR(255) COMMENT 'Qualitative faculty feedback',
  `date` DATE NOT NULL COMMENT 'Assessment evaluation date',
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------------------
-- TABLE 10: fees (Student Invoicing & Payment Settlement)
-- -----------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `title` VARCHAR(100) NOT NULL COMMENT 'Fee ledger title (e.g., Term 1 Tuition Fee, Lab Fee)',
  `amount` DECIMAL(10,2) NOT NULL COMMENT 'Charge amount in currency units',
  `due_date` DATE NOT NULL COMMENT 'Payment deadline date',
  `status` ENUM('Paid', 'Pending', 'Overdue') NOT NULL DEFAULT 'Pending',
  `paid_date` DATE COMMENT 'Date when payment was settled',
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------------------
-- TABLE 11: announcements (Institutional Notice Broadcasting)
-- -----------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `content` TEXT NOT NULL,
  `target_role` ENUM('all', 'student', 'parent', 'teacher') NOT NULL DEFAULT 'all',
  `created_by` VARCHAR(100) DEFAULT 'Admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------------------
-- TABLE 12: timetables (Weekly Period Schedule)
-- -----------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `timetables` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_id` INT NOT NULL,
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
  `period_number` INT NOT NULL COMMENT 'Class period sequence (1, 2, 3...)',
  `subject_id` INT NOT NULL,
  `teacher_id` INT NOT NULL,
  `room_number` VARCHAR(20) COMMENT 'Classroom or laboratory room number',
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE CASCADE
);
