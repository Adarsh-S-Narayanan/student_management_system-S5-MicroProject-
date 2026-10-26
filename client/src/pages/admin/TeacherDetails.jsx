import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mail, Phone, BookOpen, AlertCircle, Briefcase, GraduationCap } from 'lucide-react';

const TeacherDetails = () => {
  const { id } = useParams(); // Dynamic param: :id
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`/api/admin/teachers/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load teacher details from database.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTeacher();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Loading teacher record #{id} from database...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error || 'Teacher not found.'}</span>
        </div>
        <Link to="/admin/teachers" className="text-emerald-600 hover:underline flex items-center gap-1.5 text-sm font-semibold">
          <ArrowLeft size={16} /> Back to Teacher Roster
        </Link>
      </div>
    );
  }

  const { teacher, assignments = [] } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link
          to="/admin/teachers"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Teachers List</span>
        </Link>
      </div>

      {/* Header Profile */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
              {teacher.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-gray-900">{teacher.name}</h1>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {teacher.department || 'Faculty'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Employee ID: <span className="font-mono font-medium text-gray-700">{teacher.employee_id}</span> &bull; 
                Login ID: <span className="font-mono font-medium text-gray-700">{teacher.login_id}</span> &bull; 
                DB Teacher ID: <span className="font-mono font-medium text-gray-700">#{teacher.teacher_id}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <span className="block text-xs text-gray-400 font-medium">Email Address</span>
              <span className="text-gray-800 font-medium">{teacher.email || 'N/A'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <span className="block text-xs text-gray-400 font-medium">Phone Number</span>
              <span className="text-gray-800 font-medium">{teacher.phone || 'N/A'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-gray-400" />
            <div>
              <span className="block text-xs text-gray-400 font-medium">Department</span>
              <span className="text-gray-800 font-medium">{teacher.department || 'General Education'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Assignments */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-sm">Assigned Classes & Subjects ({assignments.length})</h3>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No class or subject assignments linked to this teacher in the database yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {assignments.map((a) => (
              <div key={a.assignment_id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{a.subject_name}</h4>
                    <span className="text-xs text-gray-400 font-mono">Code: {a.subject_code}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-200">
                    {a.class_name}
                  </span>
                  <Link
                    to={`/admin/classes/${a.class_id}`}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    View Class &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDetails;
