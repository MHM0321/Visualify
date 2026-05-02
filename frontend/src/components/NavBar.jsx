import React, { useState, useRef, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

const NavBar = ({ extraLeft, extraRight, onExport, onImport }) => {
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userName = decoded.name;
  
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

  const executeExport = (dest) => {
    onExport(exportMenu.format, dest);
    setExportMenu({ open: false, stage: 1, format: null });
  };

  return (
    <div className='flex items-center justify-between bg-bc px-12 py-3 border-b border-b-sc relative z-[100]'>
      <div className="flex items-center gap-3" ref={menuRef}>
        {/* Export Dropdown */}
        <div className="relative">
          <button onClick={() => setExportMenu({ ...exportMenu, open: !exportMenu.open, stage: 1 })}
            className="bg-pm hover:bg-opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          {exportMenu.open && (
            <div className="absolute top-11 left-0 w-48 bg-[#1a1a1a] border border-sc rounded-xl shadow-2xl py-2 overflow-hidden">
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
                    <button onClick={() => setExportMenu({...exportMenu, stage: 1})} className="hover:text-white">←</button> Save to:
                  </div>
                  <button onClick={() => executeExport('local')} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-sc text-sm">Local Device</button>
                  <button onClick={() => executeExport('drive')} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-sc text-sm">Google Drive</button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Import Dropdown */}
        <div className="relative">
          <button onClick={() => setImportOpen(!importOpen)}
            className="border border-sc text-gray-400 hover:text-white hover:border-gray-500 px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Import
          </button>
          {importOpen && (
            <div className="absolute top-11 left-0 w-48 bg-[#1a1a1a] border border-sc rounded-xl shadow-2xl py-2 overflow-hidden">
              <div className="px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Source (.json)</div>
              <button onClick={() => { onImport('local'); setImportOpen(false); }} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-sc text-sm">From Device</button>
              <button onClick={() => { onImport('drive'); setImportOpen(false); }} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-sc text-sm">Google Drive</button>
            </div>
          )}
        </div>
        {extraLeft}
      </div>

      <div className='flex items-center gap-4'>
        {extraRight}
        <h3 className='text-white text-sm font-medium'>{userName}</h3>
        <button className="w-10 h-10 rounded-full bg-pm border border-sc shadow-inner" />
      </div>
    </div>
  );
};

export default NavBar;