/**
 * =========================================================================================
 * TEACHER CONTROLLER & ATTENDANCE UPSERT LOGIC
 * =========================================================================================
 * Laboratory Course Reference:
 *   - 24INMCAL391: RDBMS Lab (High-Performance Bulk Upserts & Multi-Table Joins)
 *   - 24INMCAT307: Software Engineering (Faculty Workflows & Atomic State Updates)
 * 
 * Key RDBMS Concepts:
 *   1. DQL Relational Joins: Fetches teacher assigned classes and subjects via class_subjects.
 *   2. Atomic Bulk Upserts: Executes MySQL's 'ON DUPLICATE KEY UPDATE' inside a transaction,
 *      allowing seamless modification of attendance without unique key collisions.
 *   3. Parameterized Prepared Statements: Placeholders '?' protect against SQL Injection.
 * =========================================================================================
 */

const pool = require('../config/db');

// Get teacher info & assigned classes/subjects (RDBMS Lab: Relational JOINs)
exports.getTeacherAssignedClasses = async (req, res) => {
  try {
    const userId = req.user.id;
    const [[teacher]] = await pool.query("SELECT id FROM teachers WHERE user_id = ?", [userId]);
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found.' });

    // DQL JOIN linking class_subjects -> classes -> subjects
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
    `, [teacher.id]);

    // Also get all classes and subjects for grade entry & attendance
    const [allClasses] = await pool.query("SELECT id, CONCAT(class_name, ' - ', section) as class_name FROM classes");
    const [allSubjects] = await pool.query("SELECT id, subject_name, subject_code FROM subjects");

    res.json({ assignments, allClasses, allSubjects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching assigned classes.' });
  }
};

// Get students of a class for attendance marking on a given date
exports.getClassStudentsForAttendance = async (req, res) => {
  const classId = req.params.classId || req.query.classId;
  const date = req.query.date || new Date().toISOString().split('T')[0];

  if (!classId) {
    return res.status(400).json({ message: 'Class ID is required.' });
  }

  try {
    const [students] = await pool.query(`
      SELECT 
        s.id as student_id,
        s.roll_number,
        u.name as student_name,
        COALESCE(a.status, 'Present') as status,
        COALESCE(a.remarks, '') as remarks
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
      WHERE s.class_id = ?
      ORDER BY s.roll_number
    `, [date, classId]);

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching class students.' });
  }
};

/**
 * saveAttendance (RDBMS Lab: High-Performance Bulk Upsert & ACID Transaction)
 * Utilizes MySQL's ON DUPLICATE KEY UPDATE clause inside an isolated transaction.
 * If an attendance record for (student_id, date) already exists, it updates in-place.
 * Otherwise, a new record is inserted. This prevents duplicate key errors completely.
 */
exports.saveAttendance = async (req, res) => {
  const { class_id, date, attendanceData } = req.body;
  // attendanceData: [{ student_id, status, remarks }]
  if (!class_id || !date || !Array.isArray(attendanceData)) {
    return res.status(400).json({ message: 'Invalid payload for attendance.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction(); // Start atomic batch update

    for (const item of attendanceData) {
      // DML Query with ON DUPLICATE KEY UPDATE & Prepared Parameter Placeholders
      await conn.query(`
        INSERT INTO attendance (student_id, class_id, date, status, remarks)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)
      `, [item.student_id, class_id, date, item.status, item.remarks || '']);
    }

    await conn.commit(); // Permanent commit of all students' attendance
    res.json({ message: 'Attendance saved successfully.' });
  } catch (err) {
    await conn.rollback(); // Rollback on any failure during batch
    console.error('Error saving attendance:', err);
    res.status(500).json({ message: 'Error saving attendance.' });
  } finally {
    conn.release(); // Return connection to pool
  }
};

// Get Marks for a class and subject
exports.getClassMarks = async (req, res) => {
  const classId = req.params.classId || req.query.classId;
  const subjectId = req.params.subjectId || req.query.subjectId;
  const examType = req.query.examType;

  if (!classId || !subjectId) {
    return res.status(400).json({ message: 'Class ID and Subject ID are required.' });
  }

  try {
    const [studentsMarks] = await pool.query(`
      SELECT 
        s.id as student_id,
        s.roll_number,
        u.name as student_name,
        m.id as mark_id,
        m.marks_obtained,
        m.max_marks,
        m.remarks,
        m.exam_type
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN marks m ON s.id = m.student_id AND m.subject_id = ? AND m.exam_type = ?
      WHERE s.class_id = ?
      ORDER BY s.roll_number
    `, [subjectId, examType || 'Midterm Exam', classId]);

    res.json(studentsMarks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching marks.' });
  }
};

// Save Marks
exports.saveMarks = async (req, res) => {
  const { subject_id, exam_type, marksData } = req.body;
  // marksData: [{ student_id, marks_obtained, max_marks, remarks }]
  if (!subject_id || !exam_type || !Array.isArray(marksData)) {
    return res.status(400).json({ message: 'Invalid payload for marks.' });
  }

  const conn = await pool.getConnection();
  const today = new Date().toISOString().split('T')[0];
  try {
    await conn.beginTransaction();

    for (const item of marksData) {
      if (item.marks_obtained !== undefined && item.marks_obtained !== null && item.marks_obtained !== '') {
        // Check if existing record exists
        const [existing] = await conn.query(
          "SELECT id FROM marks WHERE student_id = ? AND subject_id = ? AND exam_type = ?",
          [item.student_id, subject_id, exam_type]
        );

        if (existing.length > 0) {
          await conn.query(
            "UPDATE marks SET marks_obtained = ?, max_marks = ?, remarks = ?, date = ? WHERE id = ?",
            [item.marks_obtained, item.max_marks || 100, item.remarks || '', today, existing[0].id]
          );
        } else {
          await conn.query(
            "INSERT INTO marks (student_id, subject_id, exam_type, marks_obtained, max_marks, remarks, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [item.student_id, subject_id, exam_type, item.marks_obtained, item.max_marks || 100, item.remarks || '', today]
          );
        }
      }
    }

    await conn.commit();
    res.json({ message: 'Marks updated successfully.' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Failed to save marks.' });
  } finally {
    conn.release();
  }
};
