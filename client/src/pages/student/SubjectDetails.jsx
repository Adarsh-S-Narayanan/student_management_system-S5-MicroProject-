import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BookOpen, User, Mail, Award, AlertCircle } from 'lucide-react';

const SubjectDetails = () => {
  const { studentId, subjectId } = useParams(); // Dynamic params: :studentId, :subjectId
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`/api/student/subjects/${subjectId}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load subject details.');
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Loading course details from database...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error || 'Subject not found.'}</span>
        </div>
        <Link to={studentId ? `/student/${studentId}` : '/student'} className="text-emerald-600 hover:underline flex items-center gap-1.5 text-sm font-semibold">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const { subject, marks = [] } = data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          to={studentId ? `/student/${studentId}` : '/student'}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{subject.subject_name}</h1>
              <span className="font-mono bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded font-semibold">
                {subject.subject_code}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Course Details &bull; Database Subject ID: #{subject.subject_id}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4 text-gray-400" />
            <span>Instructor: <strong className="text-gray-900">{subject.teacher_name || 'Assigned Faculty'}</strong></span>
          </div>
          {subject.teacher_email && (
            <div className="flex items-center gap-2 text-gray-500">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{subject.teacher_email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Subject Marks */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-gray-900 text-sm">My Grades in {subject.subject_name} ({marks.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase border-b">
              <tr>
                <th className="p-4">Exam / Test</th>
                <th className="p-4">Marks Obtained</th>
                <th className="p-4">Remarks</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {marks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400 text-sm">
                    No examination marks uploaded for this course yet.
                  </td>
                </tr>
              ) : (
                marks.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-900">{m.exam_type}</td>
                    <td className="p-4 font-bold text-emerald-600 text-base">
                      {m.marks_obtained} <span className="text-xs font-normal text-gray-400">/ {m.max_marks}</span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">{m.remarks || 'Satisfactory'}</td>
                    <td className="p-4 text-xs text-gray-400">{m.date ? new Date(m.date).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubjectDetails;
