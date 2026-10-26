import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Award, CalendarCheck, DollarSign, Megaphone, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const { studentId } = useParams();
  const currentStudentId = studentId || user?.student_id || user?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDashboard();
  }, []);

  const fetchStudentDashboard = async () => {
    try {
      const res = await axios.get('/api/student/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Student Portal...</div>;
  }

  const { student, attendanceSummary, marks, fees, announcements, timetable } = data || {};

  return (
    <div className="space-y-6">
      {/* Student Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Student Dashboard</h2>
          <p className="text-emerald-100 text-sm mt-1">
            Welcome, <span className="font-semibold">{student?.name}</span> &bull; Roll No: <span className="font-mono">{student?.roll_number}</span>
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold text-emerald-50 self-start sm:self-auto">
          {student?.class_name ? `Class: ${student.class_name} - Sec ${student.section}` : 'Student Portal'}
        </div>
      </div>

      {/* Top Cards (Attendance % & Dues) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Percentage</div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">{attendanceSummary?.attendancePct || 100}%</div>
            <div className="text-xs text-gray-400 mt-1">
              Present: {attendanceSummary?.presentDays || 0} days &bull; Absent: {attendanceSummary?.absentDays || 0} days
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Subjects</div>
            <div className="text-3xl font-extrabold text-blue-600 mt-1">{marks?.length || 0}</div>
            <div className="text-xs text-gray-400 mt-1">Evaluated exam records</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Dues</div>
            <div className="text-3xl font-extrabold text-amber-600 mt-1">
              ${fees?.filter((f) => f.status !== 'Paid').reduce((acc, curr) => acc + Number(curr.amount), 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Pending payments</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exam Report Card (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Academic Report Card & Marks</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Exam Type</th>
                    <th className="p-4">Marks Obtained</th>
                    <th className="p-4">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {marks?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-400">
                        No exam marks recorded yet.
                      </td>
                    </tr>
                  ) : (
                    marks?.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-semibold text-gray-900">
                          <Link
                            to={`/student/${currentStudentId}/subjects/${m.subject_id}`}
                            className="hover:text-emerald-600 hover:underline block"
                          >
                            {m.subject_name}
                          </Link>
                          <div className="text-xs text-gray-400 font-mono">{m.subject_code}</div>
                        </td>
                        <td className="p-4 text-xs font-medium text-gray-600">{m.exam_type}</td>
                        <td className="p-4 font-bold text-emerald-600 text-base">
                          {m.marks_obtained} <span className="text-xs font-normal text-gray-400">/ {m.max_marks}</span>
                        </td>
                        <td className="p-4 text-xs text-gray-600 italic">{m.remarks || 'Good'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fee Records */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <span>Fee Statements & Payment Status</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fees?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-400">
                        No fee bills assigned.
                      </td>
                    </tr>
                  ) : (
                    fees?.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">{f.title}</td>
                        <td className="p-4 font-semibold text-gray-900">${Number(f.amount).toFixed(2)}</td>
                        <td className="p-4 text-xs text-gray-500">{new Date(f.due_date).toLocaleDateString()}</td>
                        <td className="p-4">
                          {f.status === 'Paid' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                              <Clock className="w-3.5 h-3.5" />
                              {f.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Notices & Timetable */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-600" />
              <span>School Announcements</span>
            </h3>

            {announcements?.length === 0 ? (
              <p className="text-xs text-gray-400">No notices posted.</p>
            ) : (
              <div className="space-y-3">
                {announcements?.map((item) => (
                  <div key={item.id} className="p-3.5 bg-gray-50 rounded-lg border border-gray-100 space-y-1">
                    <div className="font-semibold text-xs text-gray-900">{item.title}</div>
                    <p className="text-xs text-gray-600">{item.content}</p>
                    <div className="text-[10px] text-gray-400 text-right">{new Date(item.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
