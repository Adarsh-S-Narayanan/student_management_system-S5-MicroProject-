import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Award, Save, CheckCircle2 } from 'lucide-react';

const InputMarks = () => {
  const { user } = useContext(AuthContext);
  const { teacherId, classId, subjectId } = useParams(); // Reads /teacher/:teacherId/marks/:classId/:subjectId
  const currTeacherId = teacherId || user?.teacher_id || user?.id;
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(classId || '');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(subjectId || '');
  const [examType, setExamType] = useState('Midterm Exam');

  const [studentsMarks, setStudentsMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Sync with URL params
  useEffect(() => {
    if (classId) setSelectedClass(Number(classId));
  }, [classId]);

  useEffect(() => {
    if (subjectId) setSelectedSubject(Number(subjectId));
  }, [subjectId]);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const res = await axios.get('/api/teacher/assignments');
      const { assignments: teacherAssigns = [], allClasses = [], allSubjects = [] } = res.data;

      setAssignments(teacherAssigns);
      setClasses(allClasses);
      setSubjects(allSubjects);

      if (classId) {
        setSelectedClass(Number(classId));
      } else if (allClasses.length > 0) {
        setSelectedClass(allClasses[0].id);
      }

      if (subjectId) {
        setSelectedSubject(Number(subjectId));
      } else if (allSubjects.length > 0) {
        setSelectedSubject(allSubjects[0].id);
      }
    } catch (err) {
      console.error('Error fetching teacher data:', err);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedSubject && examType) {
      fetchMarks();
    }
  }, [selectedClass, selectedSubject, examType]);

  const fetchMarks = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await axios.get(
        `/api/teacher/marks?classId=${selectedClass}&subjectId=${selectedSubject}&examType=${encodeURIComponent(examType)}`
      );
      setStudentsMarks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, value) => {
    setStudentsMarks((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, marks_obtained: value } : s))
    );
  };

  const handleMaxMarkChange = (studentId, value) => {
    setStudentsMarks((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, max_marks: value } : s))
    );
  };

  const handleRemarksChange = (studentId, value) => {
    setStudentsMarks((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, remarks: value } : s))
    );
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      const marksData = studentsMarks.map((s) => ({
        student_id: s.student_id,
        marks_obtained: s.marks_obtained,
        max_marks: s.max_marks || 100,
        remarks: s.remarks || ''
      }));

      await axios.post('/api/teacher/marks', {
        subject_id: selectedSubject,
        exam_type: examType,
        marksData
      });
      setSuccessMsg('Student exam marks saved successfully!');
    } catch (err) {
      alert('Failed to save marks.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Input Exam Marks & Feedback</h2>
        <p className="text-sm text-gray-500">Record marks, total score, and teacher feedback remarks</p>
      </div>

      {/* Selectors */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedClass(val);
              if (currTeacherId && val) {
                navigate(`/teacher/${currTeacherId}/marks/${val}${selectedSubject ? `/${selectedSubject}` : ''}`);
              }
            }}
            className="p-2.5 border border-gray-300 rounded-lg text-sm bg-white min-w-[160px]"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Select Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedSubject(val);
              if (currTeacherId && selectedClass && val) {
                navigate(`/teacher/${currTeacherId}/marks/${selectedClass}/${val}`);
              }
            }}
            className="p-2.5 border border-gray-300 rounded-lg text-sm bg-white min-w-[180px]"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.subject_name} ({sub.subject_code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Exam Type</label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="p-2.5 border border-gray-300 rounded-lg text-sm bg-white min-w-[180px]"
          >
            <option value="Midterm Exam">Midterm Exam</option>
            <option value="Final Exam">Final Exam</option>
            <option value="Quiz 1">Quiz 1</option>
            <option value="Quiz 2">Quiz 2</option>
            <option value="Assignment">Assignment / Project</option>
          </select>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Marks Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading student roster...</div>
        ) : studentsMarks.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No students enrolled in this class.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-4">Roll No</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Marks Obtained</th>
                  <th className="p-4">Max Marks</th>
                  <th className="p-4">Teacher Feedback / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studentsMarks.map((s) => (
                  <tr key={s.student_id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-mono font-semibold text-blue-600">{s.roll_number}</td>
                    <td className="p-4 font-medium text-gray-900">{s.student_name}</td>
                    <td className="p-4">
                      <input
                        type="number"
                        step="0.5"
                        placeholder="e.g. 85"
                        value={s.marks_obtained !== undefined && s.marks_obtained !== null ? s.marks_obtained : ''}
                        onChange={(e) => handleMarkChange(s.student_id, e.target.value)}
                        className="w-28 p-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        placeholder="100"
                        value={s.max_marks || 100}
                        onChange={(e) => handleMaxMarkChange(s.student_id, e.target.value)}
                        className="w-20 p-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-50"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        placeholder="e.g. Excellent conceptual clarity"
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

      {studentsMarks.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveMarks}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving Marks...' : 'Save Student Marks'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default InputMarks;
