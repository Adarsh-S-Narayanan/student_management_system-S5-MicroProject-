import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Award, CalendarCheck, DollarSign, Megaphone, CheckCircle2, Clock, UserCheck } from 'lucide-react';

const ParentDashboard = () => {
  const { user } = useContext(AuthContext);
  const { parentId, studentId } = useParams(); // Reads /parent/:parentId or /parent/:parentId/child/:studentId
  const currentParentId = parentId || user?.parent_id || user?.id;
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState(studentId || null);
  const [loading, setLoading] = useState(true);

  // Sync selectedChildId when URL param changes
  useEffect(() => {
    if (studentId) {
      setSelectedChildId(studentId);
    }
  }, [studentId]);

  useEffect(() => {
    fetchParentDashboard();
  }, [selectedChildId]);

  const fetchParentDashboard = async () => {
    try {
      const url = selectedChildId ? `/api/parent/child/${selectedChildId}` : '/api/parent/dashboard';
      const res = await axios.get(url);
      setData(res.data);
      if (!selectedChildId && res.data.activeStudentId) {
        setSelectedChildId(res.data.activeStudentId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <div className="p-8 text-center text-gray-500">Loading Parent Portal...</div>;
  }

  const { children = [], selectedChildData, announcements = [] } = data || {};
  const activeChild = children.find((c) => c.student_id === Number(selectedChildId)) || children[0];

  return (
    <div className="space-y-6">
      {/* Parent Welcome Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Parent Portal</h2>
          <p className="text-purple-100 text-sm mt-1">
            Welcome, <span className="font-semibold">{user?.name}</span> &bull; Monitor your children's academic progress
          </p>
        </div>
      </div>

      {/* Children Selector Tabs */}
      {children.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Child:</span>
          <div className="flex gap-2 flex-wrap">
            {children.map((child) => (
              <button
                key={child.student_id}
                onClick={() => {
                  setSelectedChildId(child.student_id);
                  navigate(`/parent/${currentParentId}/child/${child.student_id}`);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  Number(selectedChildId) === child.student_id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {child.student_name} ({child.class_name} - {child.section})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Child Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">
              {selectedChildData?.attendanceSummary?.attendancePct || 100}%
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Present: {selectedChildData?.attendanceSummary?.presentDays || 0} days &bull; Absent: {selectedChildData?.attendanceSummary?.absentDays || 0} days
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Exams Evaluated</div>
            <div className="text-3xl font-extrabold text-blue-600 mt-1">
              {selectedChildData?.marks?.length || 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">Subject report cards</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding Fees</div>
            <div className="text-3xl font-extrabold text-amber-600 mt-1">
              ${selectedChildData?.fees?.filter((f) => f.status !== 'Paid').reduce((acc, curr) => acc + Number(curr.amount), 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Pending dues</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Child Report Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span>Child Academic Performance & Remarks</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Exam Type</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Teacher Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedChildData?.marks?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-400">
                        No exam marks available for this child yet.
                      </td>
                    </tr>
                  ) : (
                    selectedChildData?.marks?.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="p-4 font-semibold text-gray-900">
                          <div>{m.subject_name}</div>
                          <div className="text-xs text-gray-400 font-mono">{m.subject_code}</div>
                        </td>
                        <td className="p-4 text-xs font-medium text-gray-600">{m.exam_type}</td>
                        <td className="p-4 font-bold text-purple-600 text-base">
                          {m.marks_obtained} <span className="text-xs font-normal text-gray-400">/ {m.max_marks}</span>
                        </td>
                        <td className="p-4 text-xs text-gray-600 italic">{m.remarks || 'No remarks'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Child Fee Dues */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <span>Child Fee Dues & Receipts</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-4">Fee Details</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedChildData?.fees?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-400">
                        No fee bills found.
                      </td>
                    </tr>
                  ) : (
                    selectedChildData?.fees?.map((f) => (
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

        {/* School Announcements */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-600" />
              <span>Notices for Parents</span>
            </h3>

            {announcements.length === 0 ? (
              <p className="text-xs text-gray-400">No notices posted.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((item) => (
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

export default ParentDashboard;
