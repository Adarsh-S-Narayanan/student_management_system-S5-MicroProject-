import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Search, UserPlus, Eye } from 'lucide-react';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    login_id: '',
    name: '',
    employee_id: '',
    department: '',
    email: '',
    phone: ''
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('/api/admin/teachers');
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher profile?')) return;
    try {
      await axios.delete(`/api/admin/teachers/${id}`);
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete teacher.');
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);
    try {
      await axios.post('/api/admin/teachers', formData);
      setShowModal(false);
      setFormData({ login_id: '', name: '', employee_id: '', department: '', email: '', phone: '' });
      fetchTeachers();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error creating teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.login_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Teachers</h2>
          <p className="text-sm text-gray-500">Add, edit, or view faculty profiles and credentials</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by teacher name, employee ID, or login ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none text-gray-900"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading teacher profiles...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-4">Employee ID</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Login ID</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      No teachers found.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((t) => (
                    <tr key={t.teacher_id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-mono font-semibold text-emerald-600">
                        <Link to={`/admin/teachers/${t.teacher_id}`} className="hover:underline">
                          {t.employee_id}
                        </Link>
                      </td>
                      <td className="p-4 font-medium text-gray-900">
                        <Link to={`/admin/teachers/${t.teacher_id}`} className="hover:text-emerald-600 hover:underline">
                          {t.name}
                        </Link>
                      </td>
                      <td className="p-4 font-mono text-gray-500">{t.login_id}</td>
                      <td className="p-4">
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-md">
                          {t.department || 'General'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        <div>{t.email || 'No email'}</div>
                        <div>{t.phone || 'No phone'}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/teachers/${t.teacher_id}`}
                            className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded hover:bg-emerald-50 transition"
                            title="View Teacher Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(t.teacher_id)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition"
                            title="Delete Teacher"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <span>Add New Teacher Faculty</span>
            </h3>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Login ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TCH103"
                    value={formData.login_id}
                    onChange={(e) => setFormData({ ...formData, login_id: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TCH103"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Teacher Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Computer Science"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="teacher@school.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="Contact number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg">
                Note: Default password for this new account will be set to <code className="font-bold">123@</code>.
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
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;
