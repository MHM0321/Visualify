import React, { useState } from 'react';

const PresenceBar = ({ viewers, onInviteClick }) => {
  const [showViewers, setShowViewers] = useState(false);

  return (
    <div className="flex items-center gap-3 relative">

      {/* Eye icon + viewer count */}
      <div className="relative">
        <button
          onClick={() => setShowViewers(v => !v)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition"
        >
          {/* Eye SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span className="text-sm font-medium">{viewers.length}</span>
        </button>

        {/* Viewer dropdown */}
        {showViewers && (
          <div className="absolute right-0 top-8 bg-bc border border-sc rounded-xl shadow-xl z-50 min-w-[180px] py-2">
            {viewers.length === 0 ? (
              <p className="text-gray-500 text-xs px-4 py-2">No viewers</p>
            ) : (
              viewers.map((v, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 hover:bg-sc hover:bg-opacity-30 transition">
                  <div className="w-6 h-6 rounded-full bg-pm flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {v.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="text-white text-sm truncate">{v.name}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* People + plus icon (invite) */}
      <button
        onClick={onInviteClick}
        className="flex items-center gap-1 text-gray-400 hover:text-white transition"
        title="Invite members"
      >
        {/* People SVG */}
        <svg width="20" height="18" viewBox="0 0 28 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="6" r="4"/>
          <path d="M1 18c0-4 3.6-7 8-7s8 3 8 7"/>
          <circle cx="20" cy="6" r="3"/>
          <path d="M20 11c3 0 6 2.2 6 6"/>
        </svg>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="6" y1="1" x2="6" y2="11"/>
          <line x1="1" y1="6" x2="11" y2="6"/>
        </svg>
      </button>
    </div>
  );
};

export default PresenceBar;