/**
 * =========================================================================================
 * STUDENT CONTROLLER & ANALYTICS QUERIES
 * =========================================================================================
 * Laboratory Courses Reference:
 *   - 24INMCAL391: RDBMS Lab (Conditional Aggregates, Multi-Table JOINs, Custom Sorts)
 *   - 24INMCAT307: Software Engineering (Student Self-Service Subsystem)
 * 
 * Key RDBMS Features Demonstrated:
 *   1. Relational Joins: Fetches student details joined with users and classes.
 *   2. Conditional SQL Aggregation: SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END)
 *      computes attendance breakdown directly in the SQL engine.
 *   3. Dynamic Percentage Metric: Math.round(((present + late * 0.5) / total) * 100).
 *   4. Custom Enum Ordering: MySQL FIELD() function for chronological timetable ordering.
 * =========================================================================================
 */

const pool = require('../config/db');

exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    // Step 1: Relational query linking students -> users -> classes
    const [[student]] = await pool.query(
      `SELECT s.id as student_id, s.roll_number, s.class_id, c.class_name, c.section, u.name, u.email 
       FROM students s 
       JOIN users u ON s.user_id = u.id 
       LEFT JOIN classes c ON s.class_id = c.id 
       WHERE s.user_id = ?`,
      [userId]
    );

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    /**
     * Step 2 (RDBMS Lab: Conditional Aggregation & Analytics):
     * Evaluates attendance breakdown in a single query pass using SQL CASE expressions.
     */
    const [[attStats]] = await pool.query(`
      SELECT 
        COUNT(*) as totalDays,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as presentDays,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absentDays,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as lateDays
      FROM attendance WHERE student_id = ?
    `, [student.student_id]);

    // Calculate overall attendance percentage (Late counts as 0.5 day)
    const attendancePct = attStats.totalDays > 0 
      ? Math.round(((attStats.presentDays + attStats.lateDays * 0.5) / attStats.totalDays) * 100) 
      : 100;

    // Step 3 (RDBMS Lab: Relational Join for Academic Transcripts)
    const [marks] = await pool.query(`
      SELECT m.*, sub.subject_name, sub.subject_code 
      FROM marks m 
      JOIN subjects sub ON m.subject_id = sub.id 
      WHERE m.student_id = ?
      ORDER BY m.date DESC
    `, [student.student_id]);

    // Step 4: Fees Summary
    const [fees] = await pool.query("SELECT * FROM fees WHERE student_id = ? ORDER BY due_date ASC", [student.student_id]);

    // Step 5: Announcements
    const [announcements] = await pool.query(
      "SELECT * FROM announcements WHERE target_role IN ('all', 'student') ORDER BY created_at DESC LIMIT 5"
    );

    /**
     * Step 6 (RDBMS Lab: Custom Enum Ordering with FIELD):
     * Orders days of the week chronologically (Monday -> Saturday) instead of alphabetical order.
     */
    const [timetable] = await pool.query(`
      SELECT t.*, sub.subject_name, u.name as teacher_name
      FROM timetables t
      JOIN subjects sub ON t.subject_id = sub.id
      JOIN teachers tch ON t.teacher_id = tch.id
      JOIN users u ON tch.user_id = u.id
      WHERE t.class_id = ?
      ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), period_number
    `, [student.class_id]);

    res.json({
      student,
      attendanceSummary: {
        ...attStats,
        attendancePct
      },
      marks,
      fees,
      announcements,
      timetable
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error loading student dashboard.' });
  }
};

exports.getSubjectDetails = async (req, res) => {
  const { subjectId } = req.params;
  const userId = req.user.id;

  try {
    const [[student]] = await pool.query(
      "SELECT id, class_id FROM students WHERE user_id = ?",
      [userId]
    );

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const [[subject]] = await pool.query(`
      SELECT 
        s.id as subject_id,
        s.subject_name,
        s.subject_code,
        u.name as teacher_name,
        u.email as teacher_email
      FROM subjects s
      LEFT JOIN class_subjects cs ON s.id = cs.subject_id AND cs.class_id = ?
      LEFT JOIN teachers t ON cs.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE s.id = ?
    `, [student.class_id, subjectId]);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    // Marks in this subject
    const [marks] = await pool.query(`
      SELECT id, exam_type, marks_obtained, max_marks, remarks, date
      FROM marks
      WHERE student_id = ? AND subject_id = ?
      ORDER BY date DESC
    `, [student.id, subjectId]);

    res.json({
      subject,
      marks
    });
  } catch (err) {
    console.error('Error fetching subject details:', err);
    res.status(500).json({ message: 'Error fetching subject details.' });
  }
};

