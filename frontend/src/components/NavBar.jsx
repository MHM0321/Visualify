import React, { useState, useRef, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router';

// Added isReadOnly prop to control button visibility for viewers
const NavBar = ({ extraLeft, extraRight, onExport, onImport, isReadOnly }) => {
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userName = decoded.name;
  const avatarUrl = decoded.avatarUrl ?? null;
  const navigate = useNavigate();
  
  const [exportMenu, setExportMenu] = useState({ open: false, stage: 1, format: null });
  const [importOpen, setImportOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setExportMenu({ open: false, stage: 1, format: null });
        setImportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className='flex items-center justify-between bg-bc px-4 md:px-12 py-3 border-b border-b-sc relative z-[100]'>
      <div className="flex items-center gap-3">
        {/* Profile avatar + name — leftmost */}
        <button
          onClick={() => navigate('/account')}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName || 'User'}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border border-sc shadow-inner"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-pm border border-sc shadow-inner flex items-center justify-center text-white text-sm font-bold">
              {userName?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <h3 className='text-tx text-sm font-medium hidden sm:block'>{userName}</h3>
        </button>

        {extraLeft}
        
        {/* Only show Design Tools if onExport is provided */}
        {onExport && (
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-sc" ref={menuRef}>
            {/* Export Button */}
            <div className="relative">
              <button 
                onClick={() => setExportMenu({ ...exportMenu, open: !exportMenu.open, stage: 1 })}
                className="bg-pm hover:bg-opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export
              </button>
              {exportMenu.open && (
                <div className="absolute top-11 left-0 w-48 bg-[#1a1a1a] border border-sc rounded-xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in duration-100">
                  {exportMenu.stage === 1 ? (
                    <>
                      <div className="px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Format</div>
                      <button onClick={() => setExportMenu({...exportMenu, stage: 2, format: 'png'})} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-sc text-sm">Image (.png)</button>
                      <button onClick={() => setExportMenu({...exportMenu, stage: 2, format: 'pdf'})} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-sc text-sm">Document (.pdf)</button>
                      <button onClick={() => setExportMenu({...exportMenu, stage: 2, format: 'json'})} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-sc text-sm">Data (.json)</button>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <button onClick={() => setExportMenu({...exportMenu, stage: 1})} className="hover:text-tx">←</button> Save to:
                      </div>
                      <button onClick={() => onExport(exportMenu.format, 'local')} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-sc text-sm">Local Device</button>
                      <button onClick={() => onExport(exportMenu.format, 'drive')} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-sc text-sm">Google Drive</button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Import Button - Hidden if User is Viewer (isReadOnly) */}
            {!isReadOnly && (
              <div className="relative">
                <button 
                  onClick={() => setImportOpen(!importOpen)}
                  className="border border-sc text-gray-400 hover:text-tx hover:border-gray-500 px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Import
                </button>
                {importOpen && (
                  <div className="absolute top-11 left-0 w-48 bg-[#1a1a1a] border border-sc rounded-xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in duration-100">
                    <div className="px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Source (.json)</div>
                    <button onClick={() => { onImport('local'); setImportOpen(false); }} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-sc text-sm">From Device</button>
                    <button onClick={() => { onImport('drive'); setImportOpen(false); }} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-sc text-sm">From Drive</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className='flex items-center gap-4'>
  {extraRight}

  {/* Settings cogwheel — rightmost */}
  <button
    onClick={() => navigate('/settings')}
    className="text-gray-500 hover:text-tx transition"
    title="Settings"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  </button>
</div>
    </div>
  );
};

export default NavBar;