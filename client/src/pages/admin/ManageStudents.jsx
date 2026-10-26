import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Search, UserPlus, Eye } from 'lucide-react';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal form state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    login_id: '',
    name: '',
    roll_number: '',
    class_id: '',
    parent_id: '',
    email: '',
    phone: '',
    address: ''
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resStds, resClasses, resParents] = await Promise.all([
        axios.get('/api/admin/students'),
        axios.get('/api/admin/classes'),
        axios.get('/api/admin/parents')
      ]);
      setStudents(resStds.data);
      setClasses(resClasses.data);
      setParents(resParents.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) return;
    try {
      await axios.delete(`/api/admin/students/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);
    try {
      await axios.post('/api/admin/students', formData);
      setShowModal(false);
      setFormData({ login_id: '', name: '', roll_number: '', class_id: '', parent_id: '', email: '', phone: '', address: '' });
      fetchData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error adding student.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.login_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Students</h2>
          <p className="text-sm text-gray-500">View, add, or delete student profiles in the system</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by student name, roll number, or login ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none text-gray-900"
        />
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading student records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-4">Roll No</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Login ID</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Parent</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-400">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std) => (
                    <tr key={std.student_id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-mono font-semibold text-blue-600">
                        <Link to={`/admin/students/${std.student_id}`} className="hover:underline">
                          {std.roll_number}
                        </Link>
                      </td>
                      <td className="p-4 font-medium text-gray-900">
                        <Link to={`/admin/students/${std.student_id}`} className="hover:text-blue-600 hover:underline">
                          {std.name}
                        </Link>
                      </td>
                      <td className="p-4 font-mono text-gray-500">{std.login_id}</td>
                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-md">
                          {std.class_name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">{std.parent_name || 'N/A'}</td>
                      <td className="p-4 text-xs text-gray-500">
                        <div>{std.email || 'No email'}</div>
                        <div>{std.phone || 'No phone'}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/students/${std.student_id}`}
                            className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition"
                            title="View Student Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(std.student_id)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition"
                            title="Delete Student"
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

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>Add New Student Profile</span>
            </h3>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Login ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STD205"
                    value={formData.login_id}
                    onChange={(e) => setFormData({ ...formData, login_id: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STD205"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Student Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Class</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.class_name} - {c.section}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Link Parent</label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select Parent</option>
                    {parents.map((p) => (
                      <option key={p.parent_id} value={p.parent_id}>
                        {p.name} (ID: {p.login_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="student@school.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="Contact phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg">
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
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
