import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, BookOpen, Layers, Eye } from 'lucide-react';

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');

  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resC, resS] = await Promise.all([
        axios.get('/api/admin/classes'),
        axios.get('/api/admin/subjects')
      ]);
      setClasses(resC.data);
      setSubjects(resS.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!className || !section) return;
    try {
      await axios.post('/api/admin/classes', { class_name: className, section });
      setClassName('');
      setSection('');
      setMessage('Class created successfully.');
      fetchData();
    } catch (err) {
      alert('Failed to add class');
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!subjectName || !subjectCode) return;
    try {
      await axios.post('/api/admin/subjects', { subject_name: subjectName, subject_code: subjectCode });
      setSubjectName('');
      setSubjectCode('');
      setMessage('Subject created successfully.');
      fetchData();
    } catch (err) {
      alert('Failed to add subject');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Classes & Subjects</h2>
        <p className="text-sm text-gray-500">Configure grade levels, class sections, and course offerings</p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Section */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Create Class & Section</span>
            </h3>
            <form onSubmit={handleAddClass} className="flex gap-3">
              <input
                type="text"
                required
                placeholder="e.g. Class 11"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                required
                placeholder="Section (e.g. A)"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-28 p-2.5 border border-gray-300 rounded-lg text-sm"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Class</span>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
              Active Class Roster ({classes.length})
            </div>
            <div className="divide-y divide-gray-100">
              {classes.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">No classes registered yet.</div>
              ) : (
                classes.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <Link to={`/admin/classes/${c.id}`} className="font-semibold text-gray-900 hover:text-blue-600 hover:underline">
                        {c.class_name}
                      </Link>
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded">
                        Section {c.section}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 font-mono">ID: {c.id}</span>
                      <Link
                        to={`/admin/classes/${c.id}`}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2.5 py-1 rounded hover:bg-blue-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Roster
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span>Add New Subject</span>
            </h3>
            <form onSubmit={handleAddSubject} className="flex gap-3">
              <input
                type="text"
                required
                placeholder="Subject Name (e.g. Physics)"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                required
                placeholder="Code (e.g. PHY101)"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-32 p-2.5 border border-gray-300 rounded-lg text-sm"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject</span>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
              Offered Subjects List ({subjects.length})
            </div>
            <div className="divide-y divide-gray-100">
              {subjects.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">No subjects registered yet.</div>
              ) : (
                subjects.map((s) => (
                  <div key={s.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <span className="font-semibold text-gray-900">{s.subject_name}</span>
                    </div>
                    <span className="font-mono text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded">
                      {s.subject_code}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageClasses;
