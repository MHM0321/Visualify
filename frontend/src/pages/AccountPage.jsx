import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import NavBar from '../components/NavBar';
import { API } from '../config';

const AccountPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const userId = decoded.id || decoded.sub;

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ owned: 0, shared: 0, screens: 0 });
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  // Detect Google user — they have an avatarUrl but their password was random
  const isGoogleUser = !!decoded.avatarUrl;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, projectsRes] = await Promise.all([
          axios.get(`${API}/api/users/me/${userId}`),
          axios.get(`${API}/api/projects/${userId}`),
        ]);
        setUser(userRes.data);
        setNewName(userRes.data.name);

        const projects = projectsRes.data;
        const owned = projects.filter(p => String(p.owner?._id ?? p.owner) === String(userId));
        const shared = projects.filter(p => String(p.owner?._id ?? p.owner) !== String(userId));

        // Count screens across owned projects
        let screenCount = 0;
        await Promise.all(owned.map(async (p) => {
          try {
            const s = await axios.get(`${API}/api/screens/${p._id}?userId=${userId}`);
            screenCount += s.data.length;
          } catch {}
        }));

        setStats({ owned: owned.length, shared: shared.length, screens: screenCount });
      } catch {
        toast.error('Failed to load account data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleRename = async () => {
    if (!newName.trim() || newName === user.name) { setRenaming(false); return; }
    try {
      const res = await axios.patch(`${API}/api/users/me/${userId}/rename`, { name: newName.trim() });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Name updated!');
      setRenaming(false);
    } catch {
      toast.error('Failed to update name');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This will permanently delete your account, all your projects and screens. This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/api/users/me/${userId}`);
      localStorage.removeItem('token');
      navigate('/');
      toast.success('Account deleted');
    } catch {
      toast.error('Failed to delete account');
    }
  };

  if (loading) return (
    <div className="bg-bc min-h-screen">
      <NavBar />
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-6 h-6 border-2 border-sc border-t-pm rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="bg-bc min-h-screen">
      <NavBar />
      <div className="max-w-xl mx-auto px-6 py-12 flex flex-col gap-8">

        {/* Back */}
        <button onClick={() => navigate('/home')} className="text-gray-500 text-sm hover:text-white transition self-start">
          ← Back
        </button>

        {/* Profile */}
        <div className="border border-sc rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex items-center gap-5">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border-2 border-sc"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-pm flex items-center justify-center text-white text-2xl font-bold border-2 border-sc">
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <h1 className="text-white text-xl font-bold">{user?.name}</h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              {isGoogleUser && (
                <div className="flex items-center gap-1.5 mt-1">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-3.5 h-3.5" />
                  <span className="text-gray-500 text-xs">Signed in with Google</span>
                </div>
              )}
            </div>
          </div>

          {/* Rename */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-xs uppercase tracking-widest">Display Name</label>
            {renaming ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false); }}
                  className="flex-1 bg-bc border border-pm rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                />
                <button onClick={handleRename} className="bg-pm text-white rounded-xl px-4 py-2.5 text-sm hover:opacity-90 transition">Save</button>
                <button onClick={() => setRenaming(false)} className="border border-sc text-gray-400 rounded-xl px-4 py-2.5 text-sm hover:text-white transition">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-bc border border-sc rounded-xl px-4 py-2.5">
                <span className="text-white text-sm">{user?.name}</span>
                <button onClick={() => setRenaming(true)} className="text-gray-500 text-xs hover:text-white transition">Edit</button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="border border-sc rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="text-gray-400 text-xs uppercase tracking-widest">Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Projects Created', value: stats.owned },
              { label: 'Shared with Me', value: stats.shared },
              { label: 'Total Screens', value: stats.screens },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1 bg-sc bg-opacity-30 rounded-xl py-4">
                <span className="text-white text-2xl font-bold">{s.value}</span>
                <span className="text-gray-500 text-xs text-center">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="border border-sc rounded-2xl p-6 flex flex-col gap-3">
          <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-2">Account</h2>
          <button
            onClick={handleLogout}
            className="w-full border border-sc text-white rounded-xl py-3 text-sm hover:bg-sc transition"
          >
            Log Out
          </button>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-900/40 rounded-2xl p-6 flex flex-col gap-3">
          <h2 className="text-red-500 text-xs uppercase tracking-widest mb-2">Danger Zone</h2>
          <p className="text-gray-500 text-sm">Permanently delete your account, all projects, and all screens. This cannot be undone.</p>
          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 text-sm font-semibold transition"
          >
            Delete My Account
          </button>
        </div>

      </div>
    </div>
  );
};

export default AccountPage;