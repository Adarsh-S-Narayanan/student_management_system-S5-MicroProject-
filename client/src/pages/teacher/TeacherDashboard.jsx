import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { CalendarCheck, Award, BookOpen, User } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const { teacherId } = useParams();
  const currentTeacherId = teacherId || user?.teacher_id || user?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get('/api/teacher/assignments');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { assignments } = data || {};

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
        <p className="text-blue-100 text-sm mt-1">Teacher ID: #{currentTeacherId} &bull; Employee ID: {user?.employee_id || 'TCH101'} &bull; Department: {user?.department || 'Mathematics'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to={`/teacher/${currentTeacherId}/attendance`}
          className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition group"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">Mark Daily Attendance</h3>
          <p className="text-sm text-gray-500">Record daily student attendance by class and date with custom status tags</p>
        </Link>

        <Link
          to={`/teacher/${currentTeacherId}/marks`}
          className="bg-white p-6 rounded-xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition group"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">Input Exam Marks & Feedback</h3>
          <p className="text-sm text-gray-500">Enter grades, quiz scores, and academic remarks for your assigned subjects</p>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span>My Teaching Assignments</span>
        </h3>

        {loading ? (
          <p className="text-sm text-gray-500">Loading teaching schedule...</p>
        ) : !assignments || assignments.length === 0 ? (
          <p className="text-sm text-gray-400">No subject assignments linked to your profile yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assignments.map((item) => (
              <div key={item.assignment_id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{item.subject_name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Code: {item.subject_code}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <Link
                      to={`/teacher/${currentTeacherId}/attendance/${item.class_id}`}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Attendance &rarr;
                    </Link>
                    <span className="text-gray-300">|</span>
                    <Link
                      to={`/teacher/${currentTeacherId}/marks/${item.class_id}/${item.subject_id}`}
                      className="text-emerald-600 hover:underline font-semibold"
                    >
                      Enter Marks &rarr;
                    </Link>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                  {item.class_name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
