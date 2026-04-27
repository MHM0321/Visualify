import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://192.168.10.6:5001';

const CreateScreen = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [screenName, setScreenName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!screenName.trim()) {
      toast.error('Screen name is required');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/screens/${projectId}`, { name: screenName.trim() });
      toast.success('Screen created!');
      navigate(`/project/${projectId}`);
    } catch (err) {
      toast.error('Failed to create screen');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-bc min-h-screen flex items-center justify-center p-6">
      <div className="border border-sc rounded-2xl p-10 w-full max-w-md flex flex-col gap-6">
        <div>
          <button
            onClick={() => navigate(`/project/${projectId}`)}
            className="text-gray-500 text-sm hover:text-white transition mb-4"
          >
            ← Back
          </button>
          <h1 className="text-white text-3xl font-bold">New Screen</h1>
          <p className="text-gray-400 text-sm mt-1">Give your screen a name</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 text-sm">Screen Name</label>
          <input
            type="text"
            value={screenName}
            onChange={(e) => setScreenName(e.target.value)}
            placeholder="e.g. Landing Page"
            className="bg-bc border border-sc rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pm"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={submitting}
          className="bg-pm text-white rounded-xl py-3 font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Screen'}
        </button>
      </div>
    </div>
  );
};

export default CreateScreen;