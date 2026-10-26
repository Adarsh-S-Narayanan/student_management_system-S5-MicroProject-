const pool = require('../config/db');

exports.getParentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const [[parent]] = await pool.query("SELECT id FROM parents WHERE user_id = ?", [userId]);

    if (!parent) {
      return res.status(404).json({ message: 'Parent profile not found.' });
    }

    // Get all children linked to this parent
    const [children] = await pool.query(`
      SELECT 
        s.id as student_id,
        s.roll_number,
        s.dob,
        s.address,
        u.name as student_name,
        u.email as student_email,
        c.class_name,
        c.section
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.parent_id = ?
    `, [parent.id]);

    if (children.length === 0) {
      return res.json({ parent, children: [], selectedChildData: null });
    }

    // Select the first child or specified studentId from params or query
    const activeStudentId = req.params.studentId || req.query.studentId || children[0].student_id;

    // 1. Child Attendance
    const [[attStats]] = await pool.query(`
      SELECT 
        COUNT(*) as totalDays,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as presentDays,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absentDays,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as lateDays
      FROM attendance WHERE student_id = ?
    `, [activeStudentId]);

    const [attendanceList] = await pool.query(
      "SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 30",
      [activeStudentId]
    );

    const attendancePct = attStats.totalDays > 0 
      ? Math.round(((attStats.presentDays + attStats.lateDays * 0.5) / attStats.totalDays) * 100) 
      : 100;

    // 2. Child Exam Marks
    const [marks] = await pool.query(`
      SELECT m.*, sub.subject_name, sub.subject_code
      FROM marks m
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE m.student_id = ?
      ORDER BY m.date DESC
    `, [activeStudentId]);

    // 3. Child Fees
    const [fees] = await pool.query("SELECT * FROM fees WHERE student_id = ? ORDER BY due_date ASC", [activeStudentId]);

    // 4. Announcements for Parent
    const [announcements] = await pool.query(
      "SELECT * FROM announcements WHERE target_role IN ('all', 'parent') ORDER BY created_at DESC LIMIT 5"
    );

    res.json({
      children,
      activeStudentId: Number(activeStudentId),
      selectedChildData: {
        attendanceSummary: { ...attStats, attendancePct },
        attendanceList,
        marks,
        fees
      },
      announcements
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching parent dashboard data.' });
  }
};
