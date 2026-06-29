import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import NavBar from '../components/NavBar';
import { useTheme } from '../hooks/useTheme';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { themes, getTheme, applyTheme } = useTheme();
  const [activeTheme, setActiveTheme] = useState(getTheme());

  const handleTheme = (themeId) => {
    applyTheme(themeId);
    setActiveTheme(themeId);
  };

  const lightThemes = ['arctic', 'paper'];
  const isLight = (id) => lightThemes.includes(id);

  return (
    <div className="bg-bc min-h-screen">
      <NavBar />
      <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">

        <button onClick={() => navigate(-1)} className="text-gray-500 text-sm hover:text-white transition self-start">
          ← Back
        </button>

        <h1 className="text-white text-2xl font-bold">Settings</h1>

        {/* ── Appearance ── */}
        <div className="border border-sc rounded-2xl p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-white font-semibold text-sm">Appearance</h2>
            <p className="text-gray-500 text-xs mt-1">Choose a theme for the entire app</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => handleTheme(theme.id)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                  activeTheme === theme.id ? 'border-pm' : 'border-sc hover:border-gray-500'
                }`}
              >
                {/* Mini preview */}
                <div className="h-16 w-full flex flex-col" style={{ backgroundColor: theme.bc }}>
                  {/* Fake navbar */}
                  <div className="h-4 w-full flex items-center px-2 gap-1" style={{ backgroundColor: theme.bc, borderBottom: `1px solid ${theme.sc}` }}>
                    <div className="w-3 h-1.5 rounded-sm" style={{ backgroundColor: theme.pm }} />
                    <div className="w-2 h-1.5 rounded-sm ml-auto" style={{ backgroundColor: theme.sc }} />
                  </div>
                  {/* Fake content */}
                  <div className="flex-1 p-1.5 flex gap-1">
                    <div className="w-5 rounded-sm" style={{ backgroundColor: theme.sc }} />
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="h-2 rounded-sm w-3/4" style={{ backgroundColor: theme.sc }} />
                      <div className="h-2 rounded-sm w-1/2" style={{ backgroundColor: theme.pm, opacity: 0.6 }} />
                    </div>
                  </div>
                </div>

                {/* Label */}
                <div
                  className="px-3 py-2 flex items-center justify-between"
                  style={{ backgroundColor: theme.bc, borderTop: `1px solid ${theme.sc}` }}
                >
                  <span className="text-xs font-medium" style={{ color: isLight(theme.id) ? '#111' : '#fff' }}>
                    {theme.label}
                  </span>
                  {activeTheme === theme.id && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.pm} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Collaboration ── */}
        <div className="border border-sc rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-white font-semibold text-sm">Collaboration</h2>
            <p className="text-gray-500 text-xs mt-1">Defaults when working with others</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">Default invite role</p>
              <p className="text-gray-500 text-xs">Role assigned when you invite someone</p>
            </div>
            <select
              defaultValue={localStorage.getItem('defaultRole') || 'viewer'}
              onChange={e => localStorage.setItem('defaultRole', e.target.value)}
              className="bg-bc border border-sc rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-pm"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
          </div>
        </div>

        {/* ── About ── */}
        <div className="border border-sc rounded-2xl p-6 flex flex-col gap-3">
          <h2 className="text-white font-semibold text-sm">About</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Version</span>
            <span className="text-gray-400 text-sm">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Built with</span>
            <span className="text-gray-400 text-sm">React + Node + MongoDB</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;