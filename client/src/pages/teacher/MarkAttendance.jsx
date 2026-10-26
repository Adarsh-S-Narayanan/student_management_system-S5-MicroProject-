/**
 * =========================================================================================
 * DAILY ATTENDANCE MANAGEMENT MODULE (MarkAttendance.jsx)
 * =========================================================================================
 * Reference in Microproject Report:
 *   - 24INMCAL393 (UI Design Lab): React Hooks (useState, useEffect, useParams, useNavigate)
 *   - 24INMCAL391 (RDBMS Lab): Atomic Bulk Upsert Workflow (ON DUPLICATE KEY UPDATE)
 *   - 24INMCAT307 (Software Engineering): Faculty Attendance Subsystem
 * 
 * Key Concepts Demonstrated:
 *   1. useParams Hook: Extracts dynamic route parameters :teacherId and :classId from the URL.
 *   2. useState Hook: Manages reactive local state variables (classes, selectedClass, date, students roster, saving flags).
 *   3. useEffect Hook (Mount): Executes once on initial render to fetch assigned class rosters.
 *   4. useEffect Hook (Dependency Array): Automatically triggers re-fetch of student records when class or date changes.
 *   5. Immutable State Updates: handleStatusChange uses Array.prototype.map() to preserve state immutability.
 *   6. Bulk API Dispatch: Submits the full class roster payload for database-side atomic upsert.
 * =========================================================================================
 */

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Save, CheckCircle2, XCircle, Clock } from 'lucide-react';

const MarkAttendance = () => {
  // useContext Hook: Read active authenticated user profile
  const { user } = useContext(AuthContext);

  // useParams Hook: Extract URL parameters /teacher/:teacherId/attendance/:classId
  const { teacherId, classId } = useParams();
  const currTeacherId = teacherId || user?.teacher_id || user?.id;
  const navigate = useNavigate();

  // useState Hooks: Declaring reactive local component states
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(classId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  /**
   * useEffect Hook 1: Synchronize selectedClass state whenever classId route parameter changes.
   */
  useEffect(() => {
    if (classId) {
      setSelectedClass(Number(classId));
    }
  }, [classId]);

  /**
   * useEffect Hook 2 (Mounting): Empty dependency array [] ensures this runs once
   * when the component mounts to load assigned classes from the backend.
   */
  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  const fetchTeacherClasses = async () => {
    try {
      const res = await axios.get('/api/teacher/assignments');
      const allClasses = res.data.allClasses || [];
      setClasses(allClasses);
      if (classId) {
        setSelectedClass(Number(classId));
      } else if (allClasses.length > 0) {
        setSelectedClass(allClasses[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * useEffect Hook 3 (Reactive Fetching): Runs whenever selectedClass OR date changes,
   * keeping the student roster synchronized with the user's dropdown and date picker selections.
   */
  useEffect(() => {
    if (selectedClass && date) {
      fetchClassStudents();
    }
  }, [selectedClass, date]);

  const fetchClassStudents = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await axios.get(`/api/teacher/attendance?classId=${selectedClass}&date=${date}`);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleStatusChange (UI Design Lab - State Immutability):
   * Modifies a student's status (Present, Absent, Late) in the array using map()
   * to produce a new array reference rather than mutating state directly.
   */
  const handleStatusChange = (studentId, status) => {
    setStudents((prev) =>
      prev.map((std) => (std.student_id === studentId ? { ...std, status } : std))
    );
  };

  const handleRemarksChange = (studentId, remarks) => {
    setStudents((prev) =>
      prev.map((std) => (std.student_id === studentId ? { ...std, remarks } : std))
    );
  };

  /**
   * handleSaveAttendance (RDBMS Lab - Batch Upsert Request):
   * Packages student attendance array and dispatches a single POST request to /api/teacher/attendance.
   * On the server, this is executed as an atomic SQL transaction with ON DUPLICATE KEY UPDATE.
   */
  const handleSaveAttendance = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      const attendanceData = students.map((s) => ({
        student_id: s.student_id,
        status: s.status,
        remarks: s.remarks
      }));
      await axios.post('/api/teacher/attendance', {
        class_id: selectedClass,
        date,
        attendanceData
      });
      setSuccessMsg('Attendance saved successfully!');
    } catch (err) {
      alert('Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAll = (status) => {
    setStudents((prev) => prev.map((std) => ({ ...std, status })));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mark Student Attendance</h2>
        <p className="text-sm text-gray-500">Select class and date to take or update attendance records</p>
      </div>

      {/* Selectors */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedClass(val);
                if (currTeacherId && val) {
                  navigate(`/teacher/${currTeacherId}/attendance/${val}`);
                }
              }}
              className="p-2.5 border border-gray-300 rounded-lg text-sm bg-white min-w-[180px]"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Attendance Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2.5 border border-gray-300 rounded-lg text-sm bg-white"
            />
          </div>
        </div>

        {/* Quick Bulk Actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Quick Mark All:</span>
          <button
            type="button"
            onClick={() => handleMarkAll('Present')}
            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md border border-emerald-200"
          >
            Present
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('Absent')}
            className="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded-md border border-red-200"
          >
            Absent
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Attendance Sheet Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading student roster...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No students enrolled in this class.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-4">Roll No</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Attendance Status</th>
                  <th className="p-4">Remarks (Optional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <tr key={s.student_id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-mono font-semibold text-blue-600">{s.roll_number}</td>
                    <td className="p-4 font-medium text-gray-900">{s.student_name}</td>
                    <td className="p-4">
                      <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50 gap-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.student_id, 'Present')}
                          className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                            s.status === 'Present'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.student_id, 'Absent')}
                          className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                            s.status === 'Absent'
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.student_id, 'Late')}
                          className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                            s.status === 'Late'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Late</span>
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        placeholder="Add note..."
                        value={s.remarks || ''}
                        onChange={(e) => handleRemarksChange(s.student_id, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {students.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Attendance Sheet'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;
