import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

const API = 'http://192.168.10.9:5001';

const CreateProject = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const userId = decoded.id;

  const [projectName, setProjectName] = useState('');

  // Member search state
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchRole, setSearchRole] = useState('viewer');
  const [searching, setSearching] = useState(false);

  // Added members list: [{ userId, name, email, role }]
  const [members, setMembers] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  const handleAddMember = async () => {
    if (!searchName.trim() || !searchEmail.trim()) {
      toast.error('Enter both name and email to search');
      return;
    }

    // Prevent duplicate
    if (members.find((m) => m.email === searchEmail.trim())) {
      toast.error('Member already added');
      return;
    }

    setSearching(true);
    try {
      const res = await axios.get(`${API}/api/users`);
      const allUsers = res.data;

      const found = allUsers.find(
        (u) =>
          u.name.toLowerCase() === searchName.trim().toLowerCase() &&
          u.email.toLowerCase() === searchEmail.trim().toLowerCase()
      );

      if (!found) {
        toast.error('No user found with that name and email');
        return;
      }

      if (found._id === userId) {
        toast.error("You're already the project owner");
        return;
      }

      setMembers((prev) => [
        ...prev,
        { userId: found._id, name: found.name, email: found.email, role: searchRole },
      ]);
      setSearchName('');
      setSearchEmail('');
      setSearchRole('viewer');
      toast.success(`${found.name} added as ${searchRole}`);
    } catch (err) {
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleRemoveMember = (email) => {
    setMembers((prev) => prev.filter((m) => m.email !== email));
  };

  const handleRoleChange = (email, newRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.email === email ? { ...m, role: newRole } : m))
    );
  };

  const handleCreate = async () => {
    if (!projectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/api/projects/${userId}`, {
        name: projectName.trim(),
        members: members.map(({ userId, role }) => ({ userId, role })),
      });
      toast.success('Project created!');
      navigate('/home');
    } catch (err) {
      toast.error('Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-bc min-h-screen flex items-center justify-center p-6">
      <div className="border border-sc rounded-2xl p-10 w-full max-w-lg flex flex-col gap-8">

        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/home')}
            className="text-gray-500 text-sm hover:text-white transition mb-4"
          >
            ← Back
          </button>
          <h1 className="text-white text-3xl font-bold">New Project</h1>
          <p className="text-gray-400 text-sm mt-1">Set up your project and invite teammates</p>
        </div>

        {/* Project Name */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-300 text-sm">Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. Mobile Redesign"
            className="bg-bc border border-sc rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pm"
          />
        </div>

        {/* Add Members */}
        <div className="flex flex-col gap-3">
          <label className="text-gray-300 text-sm">Add Members</label>

          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Member name"
              className="bg-bc border border-sc rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pm"
            />
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Member email"
              className="bg-bc border border-sc rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pm"
            />

            {/* Role selector + Add button */}
            <div className="flex gap-2">
              <select
                value={searchRole}
                onChange={(e) => setSearchRole(e.target.value)}
                className="bg-bc border border-sc rounded-xl px-3 py-3 text-white focus:outline-none focus:border-pm flex-1"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <button
                onClick={handleAddMember}
                disabled={searching}
                className="bg-sc text-white rounded-xl px-5 py-3 font-semibold hover:opacity-80 transition disabled:opacity-50"
              >
                {searching ? '...' : 'Add'}
              </button>
            </div>
          </div>
        </div>

        {/* Members List */}
        {members.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-gray-400 text-sm">Members ({members.length})</p>
            <div className="flex flex-col gap-2">
              {members.map((m) => (
                <div
                  key={m.email}
                  className="flex items-center justify-between bg-bc border border-sc rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{m.name}</p>
                    <p className="text-gray-500 text-xs">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.email, e.target.value)}
                      className="bg-bc border border-sc rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(m.email)}
                      className="text-gray-500 hover:text-red-400 transition text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={submitting}
          className="bg-pm text-white rounded-xl py-3 font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Project'}
        </button>

      </div>
    </div>
  );
};

export default CreateProject;