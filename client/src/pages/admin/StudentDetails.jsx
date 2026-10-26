import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Mail, Phone, Calendar, MapPin, 
  BookOpen, User, CheckCircle2, Clock, AlertCircle, Award 
} from 'lucide-react';

const StudentDetails = () => {
  const { id } = useParams(); // Dynamic URL param: :id
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`/api/admin/students/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load student details from database.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Loading student record #{id} from database...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error || 'Student not found.'}</span>
        </div>
        <Link to="/admin/students" className="text-blue-600 hover:underline flex items-center gap-1.5 text-sm font-semibold">
          <ArrowLeft size={16} /> Back to Student Roster
        </Link>
      </div>
    );
  }

  const { student, attendanceSummary, marks = [], fees = [] } = data;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/admin/students"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Students List</span>
        </Link>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
              {student.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                  {student.class_name || 'No Class Assigned'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Roll Number: <span className="font-mono font-medium text-gray-700">{student.roll_number}</span> &bull; 
                Login ID: <span className="font-mono font-medium text-gray-700">{student.login_id}</span> &bull; 
                DB Student ID: <span className="font-mono font-medium text-gray-700">#{student.student_id}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <span className="block text-xs text-gray-400 font-medium">Email Address</span>
              <span className="text-gray-800 font-medium">{student.email || 'N/A'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <span className="block text-xs text-gray-400 font-medium">Phone Number</span>
              <span className="text-gray-800 font-medium">{student.phone || 'N/A'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <span className="block text-xs text-gray-400 font-medium">Parent / Guardian</span>
              <span className="text-gray-800 font-medium">{student.parent_name || 'N/A'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <span className="block text-xs text-gray-400 font-medium">Address</span>
              <span className="text-gray-800 font-medium truncate max-w-[200px]" title={student.address}>
                {student.address || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance Rate</span>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">{attendanceSummary?.attendancePct}%</div>
          <span className="text-xs text-gray-400 mt-1 block">Based on recorded dates</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Present Days</span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">{attendanceSummary?.presentDays || 0}</div>
          <span className="text-xs text-gray-400 mt-1 block">Out of {attendanceSummary?.totalDays || 0} days</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Absent Days</span>
          <div className="text-3xl font-extrabold text-red-600 mt-1">{attendanceSummary?.absentDays || 0}</div>
          <span className="text-xs text-gray-400 mt-1 block">Unexcused / excused</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Late Days</span>
          <div className="text-3xl font-extrabold text-amber-500 mt-1">{attendanceSummary?.lateDays || 0}</div>
          <span className="text-xs text-gray-400 mt-1 block">Recorded arrivals</span>
        </div>
      </div>

      {/* 2-Column Section: Academic Marks & Fee Billing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Marks */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900 text-sm">Academic Marks Records ({marks.length})</h3>
          </div>
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase sticky top-0 border-b">
                <tr>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Exam</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {marks.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-400 text-xs">
                      No exam marks recorded for this student yet.
                    </td>
                  </tr>
                ) : (
                  marks.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">
                        {m.subject_name}
                        <span className="block text-xs font-mono text-gray-400">{m.subject_code}</span>
                      </td>
                      <td className="p-3 text-xs">{m.exam_type}</td>
                      <td className="p-3 font-bold text-emerald-600">
                        {m.marks_obtained} <span className="text-xs text-gray-400 font-normal">/ {m.max_marks}</span>
                      </td>
                      <td className="p-3 text-xs text-gray-500">{m.remarks || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fee Statements */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-gray-900 text-sm">Fee Statement History ({fees.length})</h3>
          </div>
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase sticky top-0 border-b">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-400 text-xs">
                      No fee records associated with this student.
                    </td>
                  </tr>
                ) : (
                  fees.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{f.title}</td>
                      <td className="p-3 font-semibold text-gray-900">${Number(f.amount).toFixed(2)}</td>
                      <td className="p-3 text-xs text-gray-500">{new Date(f.due_date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          f.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {f.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
