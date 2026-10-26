import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, UserPlus } from 'lucide-react';

const ManageParents = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    login_id: '',
    name: '',
    occupation: '',
    email: '',
    phone: ''
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const res = await axios.get('/api/admin/parents');
      setParents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParent = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);
    try {
      await axios.post('/api/admin/parents', formData);
      setShowModal(false);
      setFormData({ login_id: '', name: '', occupation: '', email: '', phone: '' });
      fetchParents();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error creating parent.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredParents = parents.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.login_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Parents</h2>
          <p className="text-sm text-gray-500">View and register parent accounts to monitor student progress</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Parent</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by parent name or login ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none text-gray-900"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading parent accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-4">Login ID</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Occupation</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredParents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400">
                      No parents found.
                    </td>
                  </tr>
                ) : (
                  filteredParents.map((p) => (
                    <tr key={p.parent_id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-mono font-semibold text-purple-600">{p.login_id}</td>
                      <td className="p-4 font-medium text-gray-900">{p.name}</td>
                      <td className="p-4 text-gray-600">{p.occupation || 'N/A'}</td>
                      <td className="p-4 text-xs text-gray-500">{p.email || 'No email'}</td>
                      <td className="p-4 text-xs text-gray-500">{p.phone || 'No phone'}</td>
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
              <UserPlus className="w-5 h-5 text-purple-600" />
              <span>Add New Parent Account</span>
            </h3>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateParent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Login ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PRN303"
                  value={formData.login_id}
                  onChange={(e) => setFormData({ ...formData, login_id: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Parent Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. Business, Engineer, Doctor"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="parent@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="Mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 text-purple-800 text-xs rounded-lg">
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
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Parent Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageParents;
