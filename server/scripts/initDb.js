const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'student_management_db';

  console.log(`Connecting to MySQL server at ${host}...`);
  try {
    const connection = await mysql.createConnection({ host, user, password });
    
    // Create Database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database '${dbName}' created or verified.`);
    await connection.changeUser({ database: dbName });

    // Table Creation Queries
    const tableQueries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        login_id VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'teacher', 'student', 'parent') NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_name VARCHAR(50) NOT NULL,
        section VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        employee_id VARCHAR(50) NOT NULL UNIQUE,
        department VARCHAR(100),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS parents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        occupation VARCHAR(100),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        roll_number VARCHAR(50) NOT NULL UNIQUE,
        class_id INT,
        parent_id INT,
        dob DATE,
        address TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL
      );`,

      `CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_name VARCHAR(100) NOT NULL,
        subject_code VARCHAR(20) NOT NULL UNIQUE
      );`,

      `CREATE TABLE IF NOT EXISTS class_subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        subject_id INT NOT NULL,
        teacher_id INT NOT NULL,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        class_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('Present', 'Absent', 'Late') NOT NULL DEFAULT 'Present',
        remarks VARCHAR(255),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_date (student_id, date)
      );`,

      `CREATE TABLE IF NOT EXISTS marks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        subject_id INT NOT NULL,
        exam_type VARCHAR(50) NOT NULL,
        marks_obtained DECIMAL(5,2) NOT NULL,
        max_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        remarks VARCHAR(255),
        date DATE NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS fees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        due_date DATE NOT NULL,
        status ENUM('Paid', 'Pending', 'Overdue') NOT NULL DEFAULT 'Pending',
        paid_date DATE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        content TEXT NOT NULL,
        target_role ENUM('all', 'student', 'parent', 'teacher') NOT NULL DEFAULT 'all',
        created_by VARCHAR(100) DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      `CREATE TABLE IF NOT EXISTS timetables (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
        period_number INT NOT NULL,
        subject_id INT NOT NULL,
        teacher_id INT NOT NULL,
        room_number VARCHAR(20),
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
      );`
    ];

    for (const q of tableQueries) {
      await connection.query(q);
    }
    console.log("All tables created successfully.");

    // Seed Data Setup
    const defaultPassword = '123@';
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash(defaultPassword, salt);

    // 1. Seed Admin
    const [existingAdmin] = await connection.query("SELECT * FROM users WHERE login_id = 'admin'");
    if (existingAdmin.length === 0) {
      await connection.query(
        "INSERT INTO users (login_id, password_hash, role, name, email, phone) VALUES (?, ?, ?, ?, ?, ?)",
        ['admin', defaultPasswordHash, 'admin', 'System Administrator', 'admin@school.edu', '9876543210']
      );
      console.log("Seeded Admin account (admin / 123@)");
    }

    // 2. Seed Classes
    const [classes] = await connection.query("SELECT * FROM classes");
    if (classes.length === 0) {
      await connection.query("INSERT INTO classes (class_name, section) VALUES ('Class 10', 'A'), ('Class 9', 'B')");
      console.log("Seeded default classes: Class 10-A, Class 9-B");
    }

    // Fetch Class IDs
    const [[c10a]] = await connection.query("SELECT id FROM classes WHERE class_name = 'Class 10' AND section = 'A'");
    const [[c9b]] = await connection.query("SELECT id FROM classes WHERE class_name = 'Class 9' AND section = 'B'");

    // 3. Seed Teachers
    const [existingTeacher] = await connection.query("SELECT * FROM users WHERE login_id = 'TCH101'");
    if (existingTeacher.length === 0) {
      const [resT1] = await connection.query(
        "INSERT INTO users (login_id, password_hash, role, name, email, phone) VALUES (?, ?, ?, ?, ?, ?)",
        ['TCH101', defaultPasswordHash, 'teacher', 'Prof. Robert Vance', 'robert.vance@school.edu', '9876543211']
      );
      await connection.query("INSERT INTO teachers (user_id, employee_id, department) VALUES (?, ?, ?)", [resT1.insertId, 'TCH101', 'Mathematics']);

      const [resT2] = await connection.query(
        "INSERT INTO users (login_id, password_hash, role, name, email, phone) VALUES (?, ?, ?, ?, ?, ?)",
        ['TCH102', defaultPasswordHash, 'teacher', 'Dr. Sarah Connor', 'sarah.connor@school.edu', '9876543212']
      );
      await connection.query("INSERT INTO teachers (user_id, employee_id, department) VALUES (?, ?, ?)", [resT2.insertId, 'TCH102', 'Science']);

      console.log("Seeded Teachers (TCH101, TCH102 / 123@)");
    }

    // 4. Seed Parents
    const [existingParent] = await connection.query("SELECT * FROM users WHERE login_id = 'PRN301'");
    if (existingParent.length === 0) {
      const [resP1] = await connection.query(
        "INSERT INTO users (login_id, password_hash, role, name, email, phone) VALUES (?, ?, ?, ?, ?, ?)",
        ['PRN301', defaultPasswordHash, 'parent', 'David Miller', 'david.miller@gmail.com', '9876543220']
      );
      await connection.query("INSERT INTO parents (user_id, occupation) VALUES (?, ?)", [resP1.insertId, 'Engineer']);

      const [resP2] = await connection.query(
        "INSERT INTO users (login_id, password_hash, role, name, email, phone) VALUES (?, ?, ?, ?, ?, ?)",
        ['PRN302', defaultPasswordHash, 'parent', 'Martha Davis', 'martha.davis@gmail.com', '9876543221']
      );
      await connection.query("INSERT INTO parents (user_id, occupation) VALUES (?, ?)", [resP2.insertId, 'Doctor']);

      console.log("Seeded Parents (PRN301, PRN302 / 123@)");
    }

    // Fetch Parent IDs
    const [[p1]] = await connection.query("SELECT p.id FROM parents p JOIN users u ON p.user_id = u.id WHERE u.login_id = 'PRN301'");
    const [[p2]] = await connection.query("SELECT p.id FROM parents p JOIN users u ON p.user_id = u.id WHERE u.login_id = 'PRN302'");

    // 5. Seed Students
    const [existingStudent] = await connection.query("SELECT * FROM users WHERE login_id = 'STD201'");
    if (existingStudent.length === 0) {
      // Student 1
      const [resS1] = await connection.query(
        "INSERT INTO users (login_id, password_hash, role, name, email, phone) VALUES (?, ?, ?, ?, ?, ?)",
        ['STD201', defaultPasswordHash, 'student', 'Alex Miller', 'alex.m@school.edu', '9876543231']
      );
      await connection.query(
        "INSERT INTO students (user_id, roll_number, class_id, parent_id, dob, address) VALUES (?, ?, ?, ?, ?, ?)",
        [resS1.insertId, 'STD201', c10a.id, p1.id, '2008-05-15', '123 Park Avenue, NY']
      );

      // Student 2
      const [resS2] = await connection.query(
        "INSERT INTO users (login_id, password_hash, role, name, email, phone) VALUES (?, ?, ?, ?, ?, ?)",
        ['STD202', defaultPasswordHash, 'student', 'Emma Miller', 'emma.m@school.edu', '9876543232']
      );
      await connection.query(
        "INSERT INTO students (user_id, roll_number, class_id, parent_id, dob, address) VALUES (?, ?, ?, ?, ?, ?)",
        [resS2.insertId, 'STD202', c10a.id, p1.id, '2008-08-20', '123 Park Avenue, NY']
      );

      // Student 3
      const [resS3] = await connection.query(
        "INSERT INTO users (login_id, password_hash, role, name, email, phone) VALUES (?, ?, ?, ?, ?, ?)",
        ['STD203', defaultPasswordHash, 'student', 'Lucas Davis', 'lucas.d@school.edu', '9876543233']
      );
      await connection.query(
        "INSERT INTO students (user_id, roll_number, class_id, parent_id, dob, address) VALUES (?, ?, ?, ?, ?, ?)",
        [resS3.insertId, 'STD203', c9b.id, p2.id, '2009-02-10', '456 Elm Street, NY']
      );

      console.log("Seeded Students (STD201, STD202, STD203 / 123@)");
    }

    // 6. Seed Subjects & Class-Subject Mapping
    const [subjects] = await connection.query("SELECT * FROM subjects");
    if (subjects.length === 0) {
      await connection.query(
        "INSERT INTO subjects (subject_name, subject_code) VALUES ('Mathematics', 'MATH101'), ('Physics', 'PHY101'), ('English Literature', 'ENG101'), ('Computer Science', 'CS101')"
      );

      const [[t1]] = await connection.query("SELECT id FROM teachers WHERE employee_id = 'TCH101'");
      const [[t2]] = await connection.query("SELECT id FROM teachers WHERE employee_id = 'TCH102'");

      const [[subMath]] = await connection.query("SELECT id FROM subjects WHERE subject_code = 'MATH101'");
      const [[subPhy]] = await connection.query("SELECT id FROM subjects WHERE subject_code = 'PHY101'");
      const [[subEng]] = await connection.query("SELECT id FROM subjects WHERE subject_code = 'ENG101'");

      await connection.query("INSERT INTO class_subjects (class_id, subject_id, teacher_id) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)", [
        c10a.id, subMath.id, t1.id,
        c10a.id, subPhy.id, t2.id,
        c9b.id, subEng.id, t1.id
      ]);
      console.log("Seeded subjects and class mappings.");
    }

    // 7. Seed Attendance, Marks, Fees, Announcements
    const [[std1]] = await connection.query("SELECT id FROM students WHERE roll_number = 'STD201'");
    const [[std2]] = await connection.query("SELECT id FROM students WHERE roll_number = 'STD202'");
    const [[std3]] = await connection.query("SELECT id FROM students WHERE roll_number = 'STD203'");

    const [att] = await connection.query("SELECT * FROM attendance");
    if (att.length === 0) {
      const dates = ['2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24'];
      for (const d of dates) {
        await connection.query("INSERT INTO attendance (student_id, class_id, date, status, remarks) VALUES (?, ?, ?, ?, ?)", [std1.id, c10a.id, d, 'Present', 'On time']);
        await connection.query("INSERT INTO attendance (student_id, class_id, date, status, remarks) VALUES (?, ?, ?, ?, ?)", [std2.id, c10a.id, d, d === '2026-09-22' ? 'Absent' : 'Present', d === '2026-09-22' ? 'Sick leave' : 'On time']);
        await connection.query("INSERT INTO attendance (student_id, class_id, date, status, remarks) VALUES (?, ?, ?, ?, ?)", [std3.id, c9b.id, d, d === '2026-09-21' ? 'Late' : 'Present', 'Normal']);
      }
      console.log("Seeded attendance logs.");
    }

    const [marks] = await connection.query("SELECT * FROM marks");
    if (marks.length === 0) {
      const [[subMath]] = await connection.query("SELECT id FROM subjects WHERE subject_code = 'MATH101'");
      const [[subPhy]] = await connection.query("SELECT id FROM subjects WHERE subject_code = 'PHY101'");

      await connection.query("INSERT INTO marks (student_id, subject_id, exam_type, marks_obtained, max_marks, remarks, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [std1.id, subMath.id, 'Midterm Exam', 92.50, 100.00, 'Excellent problem solving skills', '2026-09-10']
      );
      await connection.query("INSERT INTO marks (student_id, subject_id, exam_type, marks_obtained, max_marks, remarks, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [std1.id, subPhy.id, 'Midterm Exam', 88.00, 100.00, 'Good understanding of concepts', '2026-09-12']
      );
      await connection.query("INSERT INTO marks (student_id, subject_id, exam_type, marks_obtained, max_marks, remarks, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [std2.id, subMath.id, 'Midterm Exam', 78.00, 100.00, 'Consistently improving', '2026-09-10']
      );
      console.log("Seeded exam marks.");
    }

    const [fees] = await connection.query("SELECT * FROM fees");
    if (fees.length === 0) {
      await connection.query("INSERT INTO fees (student_id, title, amount, due_date, status, paid_date) VALUES (?, ?, ?, ?, ?, ?)",
        [std1.id, 'Term 1 Tuition Fee', 1500.00, '2026-10-15', 'Paid', '2026-09-01']
      );
      await connection.query("INSERT INTO fees (student_id, title, amount, due_date, status, paid_date) VALUES (?, ?, ?, ?, ?, ?)",
        [std1.id, 'Laboratory & Library Fee', 350.00, '2026-10-30', 'Pending', null]
      );
      await connection.query("INSERT INTO fees (student_id, title, amount, due_date, status, paid_date) VALUES (?, ?, ?, ?, ?, ?)",
        [std2.id, 'Term 1 Tuition Fee', 1500.00, '2026-10-15', 'Pending', null]
      );
      console.log("Seeded fee records.");
    }

    const [ann] = await connection.query("SELECT * FROM announcements");
    if (ann.length === 0) {
      await connection.query("INSERT INTO announcements (title, content, target_role, created_by) VALUES (?, ?, ?, ?)",
        ['Annual Science Exhibition 2026', 'All students and parents are invited to participate in the Annual Science Exhibition on Oct 10.', 'all', 'Admin']
      );
      await connection.query("INSERT INTO announcements (title, content, target_role, created_by) VALUES (?, ?, ?, ?)",
        ['Parent-Teacher Meeting (PTM)', 'PTM is scheduled for upcoming Saturday from 9 AM to 1 PM.', 'parent', 'Admin']
      );
      console.log("Seeded announcements.");
    }

    console.log("Database initialization completed successfully!");
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error("Database initialization failed:", err);
    process.exit(1);
  }
}

initDatabase();
