import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API } from '../config';

const InviteModal = ({ projectId, onClose }) => {
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchRole, setSearchRole] = useState('viewer');
  const [searching, setSearching] = useState(false);
  const [added, setAdded] = useState([]);

  const handleAdd = async () => {
    if (!searchName.trim() || !searchEmail.trim()) {
      toast.error('Enter both name and email');
      return;
    }
    if (added.find(m => m.email === searchEmail.trim())) {
      toast.error('Already added');
      return;
    }
    setSearching(true);
    try {
      const res = await axios.get(`${API}/api/users`);
      const found = res.data.find(
        u => u.name.toLowerCase() === searchName.trim().toLowerCase() &&
             u.email.toLowerCase() === searchEmail.trim().toLowerCase()
      );
      if (!found) { toast.error('No user found'); return; }
      setAdded(prev => [...prev, { userId: found._id, name: found.name, email: found.email, role: searchRole }]);
      setSearchName(''); setSearchEmail(''); setSearchRole('viewer');
      toast.success(`${found.name} added`);
    } catch { toast.error('Search failed'); }
    finally { setSearching(false); }
  };

  const handleSave = async () => {
    if (added.length === 0) { onClose(); return; }
    try {
      await axios.patch(`${API}/api/projects/${projectId}/members`, {
        members: added.map(({ userId, role }) => ({ userId, role }))
      });
      toast.success('Members invited!');
      onClose();
    } catch { toast.error('Failed to save members'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-bc border border-sc rounded-2xl p-8 w-full max-w-md flex flex-col gap-5 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Invite Members</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl transition">×</button>
        </div>

        <input type="text" value={searchName} onChange={e => setSearchName(e.target.value)}
          placeholder="Member name"
          className="bg-bc border border-sc rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pm" />
        <input type="email" value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
          placeholder="Member email"
          className="bg-bc border border-sc rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pm" />

        <div className="flex gap-2">
          <select value={searchRole} onChange={e => setSearchRole(e.target.value)}
            className="bg-bc border border-sc rounded-xl px-3 py-3 text-white focus:outline-none flex-1">
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button onClick={handleAdd} disabled={searching}
            className="bg-sc text-white rounded-xl px-5 py-3 font-semibold hover:opacity-80 transition disabled:opacity-50">
            {searching ? '...' : 'Add'}
          </button>
        </div>

        {added.length > 0 && (
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {added.map(m => (
              <div key={m.email} className="flex items-center justify-between bg-sc bg-opacity-30 rounded-xl px-4 py-2">
                <div>
                  <p className="text-white text-sm font-medium">{m.name}</p>
                  <p className="text-gray-500 text-xs">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={m.role}
                    onChange={e => setAdded(prev => prev.map(x => x.email === m.email ? { ...x, role: e.target.value } : x))}
                    className="bg-bc border border-sc rounded-lg px-2 py-1 text-white text-xs focus:outline-none">
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button onClick={() => setAdded(prev => prev.filter(x => x.email !== m.email))}
                    className="text-gray-500 hover:text-red-400 transition text-lg leading-none">×</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleSave}
          className="bg-pm text-white rounded-xl py-3 font-semibold hover:opacity-90 transition">
          {added.length > 0 ? 'Save & Invite' : 'Done'}
        </button>
      </div>
    </div>
  );
};

export default InviteModal;