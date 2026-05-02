import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import NavBar from '../components/NavBar';
import ScreenCard from '../components/ScreenCard';
import RightSidebar from '../components/RightSidebar';
import Canvas from '../components/Canvas';
import PropertiesPanel from '../components/PropertiesPanel';
import PresenceBar from '../components/PresenceBar';
import InviteModal from '../components/InviteModal';
import { useCanvas } from '../hooks/useCanvas';
import { useSocket } from '../hooks/useSocket';
import { API } from '../config';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { openDrivePicker } from '../utils/googleDriveHelper';

const ScreensPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const userId = decoded.id;
  const userName = decoded.name;

  const [screens, setScreens] = useState([]);
  const [selectedScreenId, setSelectedScreenId] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [showInvite, setShowInvite] = useState(false);

  // Mobile drawer state
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const [userRole, setUserRole] = useState('viewer');
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await axios.get(`${API}/api/projects/role/${projectId}/${userId}`);
        setUserRole(res.data.role);
      } catch { setUserRole('viewer'); }
    };
    fetchRole();
  }, [projectId, userId]);

  const { viewers, canEdit, socketRef, newScreen, emitScreenCreated } = useSocket({ screenId: selectedScreenId, userId, name: userName, role: userRole });
  const isReadOnly = !canEdit;

  const { elements, selectedId, selectedElement, setSelectedId, loadElements, addElement, addConnector, moveElement, updateProps, deleteElement } = useCanvas(selectedScreenId, isReadOnly, socketRef);

  useEffect(() => {
    const fetchScreens = async () => {
      try {
        const res = await axios.get(`${API}/api/screens/${projectId}`);
        setScreens(res.data);
        if (res.data.length > 0) setSelectedScreenId(res.data[0]._id);
      } catch { setScreens([]); }
    };
    fetchScreens();
  }, [projectId]);

  // Live sidebar: append new screen when another user creates one
  useEffect(() => {
    if (!newScreen) return;
    setScreens(prev => {
      if (prev.find(s => s._id === newScreen._id)) return prev; // dedupe
      return [...prev, newScreen];
    });
  }, [newScreen]);

  useEffect(() => {
    if (!selectedScreenId) return;
    const screen = screens.find(s => s._id === selectedScreenId);
    if (screen) loadElements(screen.content);
  }, [selectedScreenId, screens]);

  const handleSelectScreen = (id) => {
    setSelectedScreenId(id);
    setSelectedTool(null);
    setSelectedId(null);
    setLeftOpen(false); // close drawer after picking a screen on mobile
  };

  const handlePlace = useCallback((type, x, y) => {
    if (isReadOnly) return;
    addElement(type, x, y);
    setSelectedTool(null);
  }, [addElement, isReadOnly]);

  const handleSelectTool = (toolId) => {
    if (isReadOnly) { toast('View-only mode — you cannot edit this screen.', { icon: '👁️' }); return; }
    setSelectedTool(prev => prev === toolId ? null : toolId);
    setSelectedId(null);
    setRightOpen(false); // close drawer after picking tool on mobile
  };

  const handleConnectorComplete = useCallback((type, fromId, fromAnchor, toId, toAnchor) => {
    if (isReadOnly) return;
    addConnector(type, fromId, fromAnchor, toId, toAnchor);
    setSelectedTool(null);
  }, [addConnector, isReadOnly]);

const handleExport = async (format, destination) => {
    const canvasElement = document.querySelector('.canvas-container');
    if (!canvasElement) return;

    const t = toast.loading(`Generating ${format.toUpperCase()}...`);

    try {
      let content;
      const fileName = `Export_${selectedScreenId}_${Date.now()}`;

      // 1. GENERATE CONTENT
      if (format === 'json') {
        content = JSON.stringify(elements, null, 2);
      } else {
        const canvas = await html2canvas(canvasElement, {
          backgroundColor: '#121212',
          scale: 2,
          useCORS: true
        });
        
        if (format === 'png') {
          content = canvas.toDataURL('image/png');
        } else {
          const pdf = new jsPDF('l', 'px', [canvas.width, canvas.height]);
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
          content = pdf.output('blob');
        }
      }

      // 2. ROUTE TO DESTINATION
      if (destination === 'local') {
        const link = document.createElement('a');
        link.download = `${fileName}.${format}`;
        link.href = format === 'pdf' ? URL.createObjectURL(content) : (format === 'json' ? `data:text/json;charset=utf-8,${encodeURIComponent(content)}` : content);
        link.click();
        toast.success("Saved to your downloads!", { id: t });
      } else {
        await uploadToDrive(content, fileName, format);
        toast.success("Saved to Google Drive!", { id: t });
      }
    } catch (err) {
      console.error(err);
      toast.error("Export failed. Check console for details.", { id: t });
    }
  };

  const handleImport = async (source) => {
  if (source === 'local') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          loadElements(JSON.parse(event.target.result));
          toast.success("Design imported!");
        } catch { toast.error("Invalid JSON file"); }
      };
      reader.readAsText(file);
    };
    input.click();
  } else {
    // --- DRIVE PICKER LOGIC ---
    const t = toast.loading("Opening Google Drive...");
    try {
      const data = await openDrivePicker();
      loadElements(data); // Use the loadElements hook from useCanvas
      toast.success("Drive file imported!", { id: t });
    } catch (err) {
      if (err === "Picker cancelled") {
        toast.dismiss(t);
      } else {
        toast.error("Could not load from Drive", { id: t });
      }
    }
  }
};

  const handlePenStroke = useCallback((points) => {
    if (isReadOnly || points.length < 2) return;
    const xs = points.map(p => p.x), ys = points.map(p => p.y);
    const x = Math.min(...xs), y = Math.min(...ys);
    const normalized = points.map(p => ({ x: p.x - x, y: p.y - y }));
    const id = addElement('pen', x, y);
    setTimeout(() => updateProps(id, { points: normalized }), 0);
  }, [addElement, updateProps, isReadOnly]);

  const Overlay = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={onClose} />
  );

  return (
    <div className="bg-bc min-h-screen flex flex-col">
      <NavBar
        onExport={handleExport} 
        onImport={handleImport}
        extraRight={
          <PresenceBar viewers={viewers} onInviteClick={() => setShowInvite(true)} />
        }
      />

      {/* Mobile toolbar strip */}
      <div className="flex md:hidden items-center justify-between px-4 py-2 border-b border-sc">
        <button onClick={() => { setLeftOpen(o => !o); setRightOpen(false); }}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-sm">
          {/* Screens icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="18"/><rect x="14" y="3" width="7" height="18"/>
          </svg>
          Screens
        </button>

        <span className="text-gray-600 text-xs">
          {screens.find(s => s._id === selectedScreenId)?.name ?? 'No screen'}
        </span>

        <button onClick={() => { setRightOpen(o => !o); setLeftOpen(false); }}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-sm">
          Tools
          {/* Tools icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
          </svg>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">

        {/* Left sidebar — desktop: always visible, mobile: slide-in drawer */}
        {leftOpen && <Overlay onClose={() => setLeftOpen(false)} />}
        <aside className={`
          flex flex-col flex-shrink-0 h-[calc(100vh-57px)] overflow-y-auto
          bg-bc border-r border-sc
          md:w-56 md:relative md:translate-x-0 md:z-auto
          w-64 fixed top-[57px] left-0 z-40 transition-transform duration-300
          ${leftOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ height: 'calc(100vh - 57px - 41px)' }}
        >
          <div className="px-4 pt-4 pb-2">
            <button onClick={() => navigate('/home')} className="text-gray-500 text-xs hover:text-white transition">
              ← Projects
            </button>
          </div>
          <p className="text-gray-600 text-xs uppercase tracking-widest px-4 pb-3">Screens</p>
          <div className="flex flex-col gap-3 px-3 pb-3">
            {screens.map(screen => (
              <ScreenCard key={screen._id} screen={screen}
                isSelected={selectedScreenId === screen._id}
                onClick={() => handleSelectScreen(screen._id)} />
            ))}
          </div>
          <div className="px-3 pb-4 mt-1">
            <button onClick={() => navigate(`/create-screen/${projectId}`, { state: { fromSocket: true } })}
              className="w-full flex items-center justify-center gap-2 bg-sc hover:opacity-80 transition rounded-xl py-3 text-white text-sm">
              <span className="text-xl leading-none pb-0.5">+</span>
              <span>New Screen</span>
            </button>
          </div>
        </aside>

        {/* Canvas — always takes full remaining space */}
        <main className="flex-1 overflow-hidden relative min-w-0">
          {isReadOnly && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-bc border border-sc rounded-full px-4 py-1.5 text-gray-400 text-xs flex items-center gap-2 pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              View only
            </div>
          )}
          {selectedScreenId ? (
            <Canvas
              elements={elements}
              selectedId={selectedId}
              selectedTool={selectedTool}
              onPlace={handlePlace}
              onSelect={setSelectedId}
              onMove={isReadOnly ? () => {} : moveElement}
              onConnectorComplete={handleConnectorComplete}
              onPenStroke={handlePenStroke}
              readOnly={isReadOnly}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-600 text-sm">No screens yet</p>
                <button onClick={() => navigate(`/create-screen/${projectId}`, { state: { fromSocket: true } })}
                  className="mt-4 bg-sc text-white rounded-xl px-6 py-3 text-sm hover:opacity-80 transition">
                  + Create your first screen
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Right sidebar — desktop: always visible, mobile: slide-in drawer */}
        {rightOpen && <Overlay onClose={() => setRightOpen(false)} />}
        <aside className={`
          flex-shrink-0 bg-bc border-l border-sc overflow-y-auto
          md:w-52 md:relative md:translate-x-0 md:z-auto md:flex md:flex-col
          w-64 fixed top-[57px] right-0 z-40 transition-transform duration-300
          ${rightOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
        style={{ height: 'calc(100vh - 57px - 41px)' }}
        >
          <RightSidebar
            selectedTool={selectedTool}
            onSelectTool={handleSelectTool}
            propertiesSlot={
              <PropertiesPanel
                element={selectedElement}
                onUpdate={isReadOnly ? () => {} : updateProps}
                onDelete={isReadOnly ? () => {} : deleteElement}
              />
            }
          />
        </aside>

      </div>

      {showInvite && <InviteModal projectId={projectId} onClose={() => setShowInvite(false)} />}
    </div>
  );
};

export default ScreensPage;