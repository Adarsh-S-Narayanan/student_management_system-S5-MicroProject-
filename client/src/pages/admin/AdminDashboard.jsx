import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, UserCheck, HeartHandshake, BookOpen, DollarSign, Megaphone, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/api/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
  }

  const { stats, recentAnnouncements } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-sm text-gray-500">System overview and administrative controls</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</div>
            <div className="text-xs font-medium text-gray-500">Total Students</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalTeachers || 0}</div>
            <div className="text-xs font-medium text-gray-500">Total Teachers</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalParents || 0}</div>
            <div className="text-xs font-medium text-gray-500">Registered Parents</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalClasses || 0}</div>
            <div className="text-xs font-medium text-gray-500">Active Classes</div>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fees Collected</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">${Number(stats?.totalCollected || 0).toLocaleString()}</div>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Dues</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">${Number(stats?.totalPending || 0).toLocaleString()}</div>
          </div>
          <div className="p-3 bg-amber-100 text-amber-700 rounded-full">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Links & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              <span>Recent Announcements</span>
            </h3>
            <Link to="/admin/announcements" className="text-xs font-medium text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          {recentAnnouncements?.length === 0 ? (
            <p className="text-sm text-gray-500">No announcements posted yet.</p>
          ) : (
            <div className="space-y-3">
              {recentAnnouncements?.map((item) => (
                <div key={item.id} className="p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900">{item.title}</span>
                    <span className="text-xs text-gray-500">Target: {item.target_role.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="font-semibold text-gray-900 mb-2">Quick Management Actions</h3>

          <Link
            to="/admin/students"
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition text-sm font-medium text-gray-700"
          >
            <span>Add New Student</span>
            <Plus className="w-4 h-4 text-blue-600" />
          </Link>

          <Link
            to="/admin/teachers"
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 transition text-sm font-medium text-gray-700"
          >
            <span>Add New Teacher</span>
            <Plus className="w-4 h-4 text-emerald-600" />
          </Link>

          <Link
            to="/admin/fees"
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-amber-50 hover:border-amber-200 transition text-sm font-medium text-gray-700"
          >
            <span>Assign Fee Structure</span>
            <Plus className="w-4 h-4 text-amber-600" />
          </Link>

          <Link
            to="/admin/announcements"
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-200 transition text-sm font-medium text-gray-700"
          >
            <span>Broadcast Notice</span>
            <Plus className="w-4 h-4 text-purple-600" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
