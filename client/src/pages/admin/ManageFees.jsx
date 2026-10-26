import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, DollarSign, CheckCircle2, Clock } from 'lucide-react';

const ManageFees = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    title: '',
    amount: '',
    due_date: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resF, resS] = await Promise.all([
        axios.get('/api/admin/fees'),
        axios.get('/api/admin/students')
      ]);
      setFees(resF.data);
      setStudents(resS.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    try {
      await axios.patch(`/api/admin/fees/${id}/status`, { status: nextStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/admin/fees', formData);
      setShowModal(false);
      setFormData({ student_id: '', title: '', amount: '', due_date: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error assigning fee record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fee Structure & Records</h2>
          <p className="text-sm text-gray-500">Track tuition fees, payments, and overdue student balances</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Fee Record</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading fee records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Fee Title</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      No fee records found.
                    </td>
                  </tr>
                ) : (
                  fees.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-900">
                        <div>{f.student_name}</div>
                        <div className="text-xs text-gray-400 font-mono">Roll: {f.roll_number}</div>
                      </td>
                      <td className="p-4 text-gray-700 font-medium">{f.title}</td>
                      <td className="p-4 font-semibold text-gray-900">${Number(f.amount).toFixed(2)}</td>
                      <td className="p-4 text-gray-500 text-xs">{new Date(f.due_date).toLocaleDateString()}</td>
                      <td className="p-4">
                        {f.status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Paid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{f.status}</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(f.id, f.status)}
                          className={`text-xs px-3 py-1.5 rounded-md font-semibold transition ${
                            f.status === 'Paid'
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {f.status === 'Paid' ? 'Mark as Pending' : 'Mark as Paid'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <span>Assign Fee to Student</span>
            </h3>

            <form onSubmit={handleAddFee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Student *</label>
                <select
                  required
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Choose a student</option>
                  {students.map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.name} ({s.roll_number} - {s.class_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Fee Description / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 2 Tuition Fee, Examination Fee"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 500.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Assign Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFees;
