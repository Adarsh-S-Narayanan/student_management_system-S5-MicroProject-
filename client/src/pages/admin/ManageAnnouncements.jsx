import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Megaphone, Plus, Trash2 } from 'lucide-react';

const ManageAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/api/admin/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);
    try {
      await axios.post('/api/admin/announcements', { title, content, target_role: targetRole });
      setTitle('');
      setContent('');
      setTargetRole('all');
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to post announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await axios.delete(`/api/admin/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to delete announcement.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Broadcast Announcements</h2>
        <p className="text-sm text-gray-500">Post school notices to Students, Teachers, Parents, or Everyone</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post Form */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 h-fit space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-600" />
            <span>Post New Announcement</span>
          </h3>

          <form onSubmit={handleCreateNotice} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Audience</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Everyone (All Users)</option>
                <option value="student">Students Only</option>
                <option value="parent">Parents Only</option>
                <option value="teacher">Teachers Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Notice Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Science Exhibition Announcement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Announcement Message *</label>
              <textarea
                required
                rows={4}
                placeholder="Type your message here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Broadcasting...' : 'Publish Announcement'}</span>
            </button>
          </form>
        </div>

        {/* Notices List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-gray-900">Active School Notices ({announcements.length})</h3>

          {loading ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-xl border">Loading notices...</div>
          ) : announcements.length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-white rounded-xl border">No notices published yet.</div>
          ) : (
            announcements.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 relative group">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 text-base">{item.title}</h4>
                      <span className="bg-purple-100 text-purple-800 text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase">
                        {item.target_role}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      Posted by {item.created_by} &bull; {new Date(item.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.content}</p>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition opacity-80 group-hover:opacity-100"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAnnouncements;
