import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import NavBar from '../components/NavBar';
import ScreenCard from '../components/ScreenCard';
import RightSidebar from '../components/RightSidebar';

const API = 'http://192.168.10.9:5001';

const ScreensPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [screens, setScreens] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);

  useEffect(() => {
    const fetchScreens = async () => {
      try {
        const res = await axios.get(`${API}/api/screens/${projectId}`);
        setScreens(res.data);
        if (res.data.length > 0) setSelectedId(res.data[0]._id);
      } catch {
        setScreens([]);
      }
    };
    fetchScreens();
  }, [projectId]);

  const selectedScreen = screens.find((s) => s._id === selectedId);

  return (
    <div className="bg-bc min-h-screen flex flex-col">
      <NavBar />

      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar */}
        <aside className="w-56 border-r border-sc flex flex-col flex-shrink-0 h-[calc(100vh-57px)] overflow-y-auto">
          <div className="px-4 pt-4 pb-2">
            <button
              onClick={() => navigate('/home')}
              className="text-gray-500 text-xs hover:text-white transition"
            >
              ← Projects
            </button>
          </div>

          <p className="text-gray-600 text-xs uppercase tracking-widest px-4 pb-3">Screens</p>

          <div className="flex flex-col gap-3 px-3 pb-3">
            {screens.map((screen) => (
              <ScreenCard
                key={screen._id}
                screen={screen}
                isSelected={selectedId === screen._id}
                onClick={() => setSelectedId(screen._id)}
              />
            ))}
          </div>

          <div className="px-3 pb-4 mt-1">
            <button
              onClick={() => navigate(`/create-screen/${projectId}`)}
              className="w-full flex items-center justify-center gap-2 bg-sc hover:opacity-80 transition rounded-xl py-3 text-white text-sm"
            >
              <span className="text-xl leading-none pb-0.5">+</span>
              <span>New Screen</span>
            </button>
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 flex items-center justify-center">
          {selectedScreen ? (
            <div className="text-center">
              <p className="text-gray-600 text-sm">{selectedScreen.name}</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 text-sm">No screens yet</p>
              <button
                onClick={() => navigate(`/create-screen/${projectId}`)}
                className="mt-4 bg-sc text-white rounded-xl px-6 py-3 text-sm hover:opacity-80 transition"
              >
                + Create your first screen
              </button>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <RightSidebar selectedTool={selectedTool} onSelectTool={setSelectedTool} />

      </div>
    </div>
  );
};

export default ScreensPage;