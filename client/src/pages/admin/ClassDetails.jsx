import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Users, BookOpen, AlertCircle, CalendarCheck, Award, Eye } from 'lucide-react';

const ClassDetails = () => {
  const { classId } = useParams(); // Dynamic param: :classId
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClass = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`/api/admin/classes/${classId}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load class details from database.');
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchClass();
    }
  }, [classId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Loading class record #{classId} from database...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error || 'Class not found.'}</span>
        </div>
        <Link to="/admin/classes" className="text-blue-600 hover:underline flex items-center gap-1.5 text-sm font-semibold">
          <ArrowLeft size={16} /> Back to Classes
        </Link>
      </div>
    );
  }

  const { classData, totalStudents, students = [], subjects = [] } = data;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <Link
          to="/admin/classes"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Classes List</span>
        </Link>
      </div>

      {/* Header Profile */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900">{classData.class_name}</h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
              Section {classData.section}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Database Class ID: <span className="font-mono font-medium">#{classData.id}</span> &bull; 
            Enrolled Students: <span className="font-semibold text-gray-700">{totalStudents}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrolled Students Table (Takes 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-sm">Enrolled Students Roster ({students.length})</h3>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase sticky top-0 border-b">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-400 text-sm">
                      No students enrolled in this class yet.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.student_id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-semibold text-blue-600">
                        <Link to={`/admin/students/${s.student_id}`} className="hover:underline">
                          {s.roll_number}
                        </Link>
                      </td>
                      <td className="p-3 font-medium text-gray-900">
                        <Link to={`/admin/students/${s.student_id}`} className="hover:text-blue-600 hover:underline">
                          {s.name}
                        </Link>
                      </td>
                      <td className="p-3 text-xs text-gray-500">
                        <div>{s.email || 'No email'}</div>
                        <div>{s.phone || 'No phone'}</div>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          to={`/admin/students/${s.student_id}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2 py-1 rounded"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subjects & Teachers (Takes 1 col) */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-gray-900 text-sm">Subjects & Faculty</h3>
          </div>

          <div className="divide-y divide-gray-100 p-2">
            {subjects.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No subjects assigned to this class yet.
              </div>
            ) : (
              subjects.map((sub) => (
                <div key={sub.assignment_id} className="p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-800 text-sm">{sub.subject_name}</span>
                    <span className="text-xs font-mono text-gray-400">{sub.subject_code}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    Faculty: {' '}
                    <Link
                      to={`/admin/teachers/${sub.teacher_id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {sub.teacher_name}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;
