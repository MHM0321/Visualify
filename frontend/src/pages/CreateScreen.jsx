import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API } from '../config';

const CreateScreen = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Screen name is required');
      return;
    }
    setCreating(true);
    try {
      await axios.post(`${API}/api/screens/${projectId}`, { name: name.trim() });
      toast.success('Screen created!');
      navigate(`/project/${projectId}`);
    } catch {
      toast.error('Failed to create screen');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-bc min-h-screen flex items-center justify-center">
      <div className="border border-sc rounded-2xl p-10 w-full max-w-md flex flex-col gap-6">
        <button
          onClick={() => navigate(`/project/${projectId}`)}
          className="text-gray-500 text-sm hover:text-white transition"
        >
          ← Back
        </button>
        <h1 className="text-white text-3xl font-bold">New Screen</h1>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 text-sm">Screen Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Home Screen"
            className="bg-bc border border-sc rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pm"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={creating}
          className="bg-pm text-white rounded-xl py-3 font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Screen'}
        </button>
      </div>
    </div>
  );
};

export default CreateScreen;