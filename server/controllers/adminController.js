/**
 * =========================================================================================
 * ADMINISTRATOR CONTROLLER & BUSINESS LOGIC
 * =========================================================================================
 * Laboratory Courses Reference:
 *   - 24INMCAL391: RDBMS Lab (Multi-Table JOINs, SQL Aggregates, ACID Transactions)
 *   - 24INMCAT307: Software Engineering (Master Institutional Administration & Cryptography)
 * 
 * Key RDBMS Concepts Demonstrated:
 *   1. DQL Aggregate Analytics: COUNT(*), SUM(), COALESCE() for real-time dashboards.
 *   2. Multi-Table Relational JOINs: 5-table join linking students, users, classes, and parents.
 *   3. ACID Transactions: Explicit beginTransaction(), commit(), and rollback() ensuring
 *      atomic multi-table insertion of user credentials and student/teacher domain profiles.
 *   4. Cryptographic Security: Bcrypt salted password hashing (10 rounds).
 * =========================================================================================
 */

const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. Get Admin Dashboard Summary Stats (RDBMS Lab: SQL Aggregate Queries)
exports.getDashboardStats = async (req, res) => {
  try {
    // DQL Aggregates: Counting entities across normalized tables
    const [[{ totalStudents }]] = await pool.query("SELECT COUNT(*) as totalStudents FROM students");
    const [[{ totalTeachers }]] = await pool.query("SELECT COUNT(*) as totalTeachers FROM teachers");
    const [[{ totalParents }]] = await pool.query("SELECT COUNT(*) as totalParents FROM parents");
    const [[{ totalClasses }]] = await pool.query("SELECT COUNT(*) as totalClasses FROM classes");
    
    // Financial Totals: COALESCE handles NULL cases when table is empty, returning 0
    const [[{ totalCollected }]] = await pool.query("SELECT COALESCE(SUM(amount), 0) as totalCollected FROM fees WHERE status = 'Paid'");
    const [[{ totalPending }]] = await pool.query("SELECT COALESCE(SUM(amount), 0) as totalPending FROM fees WHERE status != 'Paid'");
    
    // Recent Announcements: Chronological sorting with LIMIT
    const [recentAnnouncements] = await pool.query("SELECT * FROM announcements ORDER BY created_at DESC LIMIT 5");

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalParents,
        totalClasses,
        totalCollected,
        totalPending
      },
      recentAnnouncements
    });
  } catch (err) {
    console.error('Admin Dashboard Stats error:', err);
    res.status(500).json({ message: 'Error fetching admin dashboard statistics.' });
  }
};

// 2. Students Management (RDBMS Lab: 5-Table Relational JOIN Query)
exports.getAllStudents = async (req, res) => {
  try {
    /**
     * DQL Multi-Table JOIN:
     * Links students -> users (for student biodata)
     *       students -> classes (for grade and section name)
     *       students -> parents (for guardian profile)
     *       parents  -> users (for guardian name)
     */
    const [students] = await pool.query(`
      SELECT 
        s.id as student_id,
        s.roll_number,
        s.dob,
        s.address,
        u.id as user_id,
        u.login_id,
        u.name,
        u.email,
        u.phone,
        c.id as class_id,
        CONCAT(c.class_name, ' - ', c.section) as class_name,
        p.id as parent_id,
        pu.name as parent_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN parents p ON s.parent_id = p.id
      LEFT JOIN users pu ON p.user_id = pu.id
      ORDER BY s.id DESC
    `);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students.' });
  }
};

/**
 * addStudent (RDBMS Lab & Software Engineering: ACID Transaction Management)
 * Atomically inserts records into 'users' and 'students'.
 * If the second query fails (e.g., duplicate roll number), rollback() ensures
 * the inserted user is permanently erased from 'users', preventing orphaned records.
 */
exports.addStudent = async (req, res) => {
  const { login_id, name, email, phone, roll_number, class_id, parent_id, dob, address } = req.body;
  
  if (!login_id || !name || !roll_number) {
    return res.status(400).json({ message: 'Login ID, Name, and Roll Number are required.' });
  }

  // Obtain dedicated connection from pool for transaction isolation
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction(); // STEP 1: Begin ACID Transaction

    // Security: Cryptographic Salted Password Hash (Bcrypt 10 rounds)
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('123@', salt);

    // STEP 2: Parameterized INSERT into master 'users' table
    const [userResult] = await conn.query(
      "INSERT INTO users (login_id, password_hash, role, name, email, phone) VALUES (?, ?, 'student', ?, ?, ?)",
      [login_id.trim(), password_hash, name.trim(), email || null, phone || null]
    );

    // STEP 3: Parameterized INSERT into 'students' table referencing generated user_id
    await conn.query(
      "INSERT INTO students (user_id, roll_number, class_id, parent_id, dob, address) VALUES (?, ?, ?, ?, ?, ?)",
      [userResult.insertId, roll_number.trim(), class_id || null, parent_id || null, dob || null, address || null]
    );

    await conn.commit(); // STEP 4: Commit both operations atomically
    res.status(201).json({ message: 'Student created successfully with default password "123@".' });
  } catch (err) {
    await conn.rollback(); // STEP 5: Rollback on any failure - zero orphaned rows
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Login ID or Roll Number already exists.' });
    }
    res.status(500).json({ message: 'Failed to create student.' });
  } finally {
    conn.release(); // STEP 6: Return connection to pool
  }
};

exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const [[student]] = await pool.query("SELECT user_id FROM students WHERE id = ?", [id]);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    await pool.query("DELETE FROM users WHERE id = ?", [student.user_id]);
    res.json({ message: 'Student deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting student.' });
  }
};

// 3. Teachers Management
exports.getAllTeachers = async (req, res) => {
  try {
    const [teachers] = await pool.query(`
      SELECT 
        t.id as teacher_id,
        t.employee_id,
        t.department,
        u.id as user_id,
        u.login_id,
        u.name,
        u.email,
        u.phone
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.id DESC
    `);
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teachers.' });
  }
};

exports.addTeacher = async (req, res) => {
  const { login_id, name, email, phone, employee_id, department } = req.body;
  if (!login_id || !name || !employee_id) {
    return res.status(400).json({ message: 'Login ID, Name, and Employee ID are required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('123@', salt);

    const [userResult] = await conn.query(
      "INSERT INTO users (login_id, password_hash, role, name, email, phone) VALUES (?, ?, 'teacher', ?, ?, ?)",
      [login_id.trim(), password_hash, name.trim(), email || null, phone || null]
    );

    await conn.query(
      "INSERT INTO teachers (user_id, employee_id, department) VALUES (?, ?, ?)",
      [userResult.insertId, employee_id.trim(), department || 'General']
    );

    await conn.commit();
    res.status(201).json({ message: 'Teacher created successfully with default password "123@".' });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Login ID or Employee ID already exists.' });
    }
    res.status(500).json({ message: 'Failed to create teacher.' });
  } finally {
    conn.release();
  }
};

exports.deleteTeacher = async (req, res) => {
  const { id } = req.params;
  try {
    const [[teacher]] = await pool.query("SELECT user_id FROM teachers WHERE id = ?", [id]);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });

    await pool.query("DELETE FROM users WHERE id = ?", [teacher.user_id]);
    res.json({ message: 'Teacher deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting teacher.' });
  }
};

// 4. Parents Management
exports.getAllParents = async (req, res) => {
  try {
    const [parents] = await pool.query(`
      SELECT 
        p.id as parent_id,
        p.occupation,
        u.id as user_id,
        u.login_id,
        u.name,
        u.email,
        u.phone
      FROM parents p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.id DESC
    `);
    res.json(parents);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching parents.' });
  }
};

exports.addParent = async (req, res) => {
  const { login_id, name, email, phone, occupation } = req.body;
  if (!login_id || !name) {
    return res.status(400).json({ message: 'Login ID and Name are required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('123@', salt);

    const [userResult] = await conn.query(
      "INSERT INTO users (login_id, password_hash, role, name, email, phone) VALUES (?, ?, 'parent', ?, ?, ?)",
      [login_id.trim(), password_hash, name.trim(), email || null, phone || null]
    );

    await conn.query(
      "INSERT INTO parents (user_id, occupation) VALUES (?, ?)",
      [userResult.insertId, occupation || null]
    );

    await conn.commit();
    res.status(201).json({ message: 'Parent created successfully with default password "123@".' });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Login ID already exists.' });
    }
    res.status(500).json({ message: 'Failed to create parent.' });
  } finally {
    conn.release();
  }
};

// 5. Classes & Subjects
exports.getAllClasses = async (req, res) => {
  try {
    const [classes] = await pool.query("SELECT * FROM classes ORDER BY class_name, section");
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching classes.' });
  }
};

exports.addClass = async (req, res) => {
  const { class_name, section } = req.body;
  if (!class_name || !section) return res.status(400).json({ message: 'Class name and section are required.' });

  try {
    await pool.query("INSERT INTO classes (class_name, section) VALUES (?, ?)", [class_name.trim(), section.trim()]);
    res.status(201).json({ message: 'Class created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating class.' });
  }
};

exports.getAllSubjects = async (req, res) => {
  try {
    const [subjects] = await pool.query("SELECT * FROM subjects ORDER BY subject_name");
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subjects.' });
  }
};

exports.addSubject = async (req, res) => {
  const { subject_name, subject_code } = req.body;
  if (!subject_name || !subject_code) return res.status(400).json({ message: 'Subject name and code are required.' });

  try {
    await pool.query("INSERT INTO subjects (subject_name, subject_code) VALUES (?, ?)", [subject_name.trim(), subject_code.trim()]);
    res.status(201).json({ message: 'Subject created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating subject.' });
  }
};

// 6. Fees Management
exports.getAllFees = async (req, res) => {
  try {
    const [fees] = await pool.query(`
      SELECT 
        f.*,
        s.roll_number,
        u.name as student_name,
        c.class_name,
        c.section
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      ORDER BY f.id DESC
    `);
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching fee records.' });
  }
};

exports.addFeeRecord = async (req, res) => {
  const { student_id, title, amount, due_date } = req.body;
  if (!student_id || !title || !amount || !due_date) {
    return res.status(400).json({ message: 'Student, Title, Amount, and Due Date are required.' });
  }

  try {
    await pool.query(
      "INSERT INTO fees (student_id, title, amount, due_date, status) VALUES (?, ?, ?, ?, 'Pending')",
      [student_id, title.trim(), amount, due_date]
    );
    res.status(201).json({ message: 'Fee record assigned successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error assigning fee record.' });
  }
};

exports.updateFeeStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Paid', 'Pending', 'Overdue'

  try {
    const paid_date = status === 'Paid' ? new Date().toISOString().split('T')[0] : null;
    await pool.query("UPDATE fees SET status = ?, paid_date = ? WHERE id = ?", [status, paid_date, id]);
    res.json({ message: 'Fee status updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating fee status.' });
  }
};

// 7. Announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const [announcements] = await pool.query("SELECT * FROM announcements ORDER BY created_at DESC");
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching announcements.' });
  }
};

exports.createAnnouncement = async (req, res) => {
  const { title, content, target_role } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Title and content are required.' });

  try {
    await pool.query(
      "INSERT INTO announcements (title, content, target_role, created_by) VALUES (?, ?, ?, ?)",
      [title.trim(), content.trim(), target_role || 'all', req.user.name || 'Admin']
    );
    res.status(201).json({ message: 'Announcement created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating announcement.' });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM announcements WHERE id = ?", [id]);
    res.json({ message: 'Announcement deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting announcement.' });
  }
};

// 7. Dynamic Single Entity Details
exports.getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [[student]] = await pool.query(`
      SELECT 
        s.id as student_id,
        s.roll_number,
        s.dob,
        s.address,
        u.id as user_id,
        u.login_id,
        u.name,
        u.email,
        u.phone,
        c.id as class_id,
        CONCAT(c.class_name, ' - ', c.section) as class_name,
        p.id as parent_id,
        pu.name as parent_name,
        pu.phone as parent_phone,
        pu.email as parent_email
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN parents p ON s.parent_id = p.id
      LEFT JOIN users pu ON p.user_id = pu.id
      WHERE s.id = ?
    `, [id]);

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Attendance stats
    const [[attStats]] = await pool.query(`
      SELECT 
        COUNT(*) as totalDays,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as presentDays,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absentDays,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as lateDays
      FROM attendance WHERE student_id = ?
    `, [id]);

    const attendancePct = attStats.totalDays > 0 
      ? Math.round(((attStats.presentDays + attStats.lateDays * 0.5) / attStats.totalDays) * 100) 
      : 100;

    // Academic Marks
    const [marks] = await pool.query(`
      SELECT m.*, sub.subject_name, sub.subject_code
      FROM marks m
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE m.student_id = ?
      ORDER BY m.id DESC
    `, [id]);

    // Fees
    const [fees] = await pool.query("SELECT * FROM fees WHERE student_id = ? ORDER BY due_date ASC", [id]);

    res.json({
      student,
      attendanceSummary: { ...attStats, attendancePct },
      marks,
      fees
    });
  } catch (err) {
    console.error('Error fetching student details:', err);
    res.status(500).json({ message: 'Error retrieving student details.' });
  }
};

exports.getTeacherById = async (req, res) => {
  const { id } = req.params;
  try {
    const [[teacher]] = await pool.query(`
      SELECT 
        t.id as teacher_id,
        t.employee_id,
        t.department,
        u.id as user_id,
        u.login_id,
        u.name,
        u.email,
        u.phone
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [id]);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    const [assignments] = await pool.query(`
      SELECT 
        cs.id as assignment_id,
        c.id as class_id,
        CONCAT(c.class_name, ' - ', c.section) as class_name,
        sub.id as subject_id,
        sub.subject_name,
        sub.subject_code
      FROM class_subjects cs
      JOIN classes c ON cs.class_id = c.id
      JOIN subjects sub ON cs.subject_id = sub.id
      WHERE cs.teacher_id = ?
    `, [id]);

    res.json({ teacher, assignments });
  } catch (err) {
    console.error('Error fetching teacher details:', err);
    res.status(500).json({ message: 'Error retrieving teacher details.' });
  }
};

exports.getClassById = async (req, res) => {
  const { id } = req.params;
  try {
    const [[classData]] = await pool.query(`
      SELECT id, class_name, section, created_at
      FROM classes
      WHERE id = ?
    `, [id]);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found.' });
    }

    const [students] = await pool.query(`
      SELECT 
        s.id as student_id,
        s.roll_number,
        u.name,
        u.email,
        u.phone
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.class_id = ?
      ORDER BY s.roll_number ASC
    `, [id]);

    const [subjects] = await pool.query(`
      SELECT 
        cs.id as assignment_id,
        sub.id as subject_id,
        sub.subject_name,
        sub.subject_code,
        t.id as teacher_id,
        u.name as teacher_name
      FROM class_subjects cs
      JOIN subjects sub ON cs.subject_id = sub.id
      JOIN teachers t ON cs.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE cs.class_id = ?
    `, [id]);

    res.json({
      classData,
      totalStudents: students.length,
      students,
      subjects
    });
  } catch (err) {
    console.error('Error fetching class details:', err);
    res.status(500).json({ message: 'Error retrieving class details.' });
  }
};

