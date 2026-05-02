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
  const [projectData, setProjectData] = useState(null);
  const [screens, setScreens] = useState([]);
  const [selectedScreenId, setSelectedScreenId] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // --- AUTH & PERMISSIONS LOGIC ---
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const userName = decoded.name;
  
  // Handles both standard ID and Google 'sub' ID
  const currentUserId = decoded.id || decoded.sub;

  // 1. Fetch Project Data to determine ownership
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${API}/api/projects/single/${projectId}`);
        setProjectData(res.data);
      } catch (err) {
        console.error("Failed to fetch project data", err);
      }
    };
    fetchProject();
  }, [projectId]);

  // 2. Determine Permissions — use correct schema fields: owner + members[].userId/role
  const isOwner = projectData && String(projectData.owner) === String(currentUserId);
  const isEditor = isOwner || projectData?.members?.some(m =>
    String(m.userId) === String(currentUserId) && m.role === 'editor'
  );
  const isReadOnly = !isEditor;

  // --- SOCKET & CANVAS HOOKS ---
  const { viewers, socketRef, newScreen } = useSocket({ 
    screenId: selectedScreenId, 
    userId: currentUserId, 
    name: userName, 
    role: isReadOnly ? 'viewer' : 'editor' 
  });

  const { 
    elements, selectedId, selectedElement, setSelectedId, 
    loadElements, addElement, addConnector, moveElement, 
    updateProps, deleteElement 
  } = useCanvas(selectedScreenId, isReadOnly, socketRef);

  // --- SCREEN MANAGEMENT ---
  useEffect(() => {
    const fetchScreens = async () => {
      try {
        const res = await axios.get(`${API}/api/screens/${projectId}`);
        setScreens(res.data);
        if (res.data.length > 0 && !selectedScreenId) setSelectedScreenId(res.data[0]._id);
      } catch { setScreens([]); }
    };
    fetchScreens();
  }, [projectId, selectedScreenId]);

  useEffect(() => {
    if (!newScreen) return;
    setScreens(prev => {
      if (prev.find(s => s._id === newScreen._id)) return prev;
      return [...prev, newScreen];
    });
  }, [newScreen]);

  useEffect(() => {
    if (!selectedScreenId) return;
    const screen = screens.find(s => s._id === selectedScreenId);
    if (screen) loadElements(screen.content);
  }, [selectedScreenId, screens, loadElements]);

  // --- HANDLERS ---
  const handleSelectScreen = (id) => {
    setSelectedScreenId(id);
    setSelectedTool(null);
    setSelectedId(null);
    setLeftOpen(false);
  };

  const handlePlace = useCallback((type, x, y) => {
    if (isReadOnly) return;
    addElement(type, x, y);
    setSelectedTool(null);
  }, [addElement, isReadOnly]);

  const handleSelectTool = (toolId) => {
    if (isReadOnly) { 
        toast('View-only mode — you cannot edit.', { icon: '👁️' }); 
        return; 
    }
    setSelectedTool(prev => prev === toolId ? null : toolId);
    setSelectedId(null);
    setRightOpen(false);
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

      if (destination === 'local') {
        const link = document.createElement('a');
        link.download = `${fileName}.${format}`;
        link.href = format === 'pdf' ? URL.createObjectURL(content) : (format === 'json' ? `data:text/json;charset=utf-8,${encodeURIComponent(content)}` : content);
        link.click();
        toast.success("Saved to downloads!", { id: t });
      } else {
        // Assume uploadToDrive is defined in your helper or globally
        toast.error("Drive upload logic required", { id: t });
      }
    } catch (err) {
      toast.error("Export failed", { id: t });
    }
  };

  const handleImport = async (source) => {
    if (isReadOnly) {
      toast.error("Viewers cannot import designs.");
      return;
    }

    if (!window.confirm("⚠️ WARNING: This will replace all current elements. Continue?")) return;

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
            toast.success("Imported!");
          } catch { toast.error("Invalid file"); }
        };
        reader.readAsText(file);
      };
      input.click();
    } else {
      const t = toast.loading("Opening Drive...");
      try {
        const data = await openDrivePicker();
        loadElements(data);
        toast.success("Drive import successful!", { id: t });
      } catch (err) {
        err === "Picker cancelled" ? toast.dismiss(t) : toast.error("Drive error", { id: t });
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
        isReadOnly={isReadOnly}
        extraRight={<PresenceBar viewers={viewers} onInviteClick={() => setShowInvite(true)} />}
      />

      {/* Mobile toolbar strip */}
      <div className="flex md:hidden items-center justify-between px-4 py-2 border-b border-sc">
        <button onClick={() => { setLeftOpen(o => !o); setRightOpen(false); }} className="text-gray-400 text-sm flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="18"/><rect x="14" y="3" width="7" height="18"/></svg>
          Screens
        </button>
        <span className="text-gray-600 text-xs">{screens.find(s => s._id === selectedScreenId)?.name ?? 'No screen'}</span>
        <button onClick={() => { setRightOpen(o => !o); setLeftOpen(false); }} className="text-gray-400 text-sm">Tools</button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {leftOpen && <Overlay onClose={() => setLeftOpen(false)} />}
        <aside className={`flex flex-col flex-shrink-0 h-full bg-bc border-r border-sc md:w-56 md:relative w-64 fixed top-[57px] left-0 z-40 transition-transform duration-300 ${leftOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="px-4 pt-4 pb-2">
            <button onClick={() => navigate('/home')} className="text-gray-500 text-xs hover:text-white">← Projects</button>
          </div>
          <p className="text-gray-600 text-xs uppercase px-4 pb-3">Screens</p>
          <div className="flex flex-col gap-3 px-3 pb-3">
            {screens.map(screen => (
              <ScreenCard key={screen._id} screen={screen} isSelected={selectedScreenId === screen._id} onClick={() => handleSelectScreen(screen._id)} />
            ))}
          </div>
          <div className="px-3 pb-4">
            <button onClick={() => navigate(`/create-screen/${projectId}`, { state: { fromSocket: true } })} className="w-full bg-sc hover:opacity-80 rounded-xl py-3 text-white text-sm">+ New Screen</button>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden relative min-w-0">
          {isReadOnly && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-bc border border-sc rounded-full px-4 py-1.5 text-gray-400 text-xs flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View only
            </div>
          )}
          {selectedScreenId ? (
            <Canvas
              elements={elements} selectedId={selectedId} selectedTool={selectedTool}
              onPlace={handlePlace} onSelect={setSelectedId} onMove={isReadOnly ? () => {} : moveElement}
              onConnectorComplete={handleConnectorComplete} onPenStroke={handlePenStroke} readOnly={isReadOnly}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600">No screen selected</div>
          )}
        </main>

        {rightOpen && <Overlay onClose={() => setRightOpen(false)} />}
        <aside className={`flex-shrink-0 bg-bc border-l border-sc md:w-52 md:relative w-64 fixed top-[57px] right-0 z-40 transition-transform duration-300 ${rightOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          <RightSidebar
            selectedTool={selectedTool} onSelectTool={handleSelectTool}
            propertiesSlot={<PropertiesPanel element={selectedElement} onUpdate={isReadOnly ? () => {} : updateProps} onDelete={isReadOnly ? () => {} : deleteElement} />}
          />
        </aside>
      </div>

      {showInvite && <InviteModal projectId={projectId} onClose={() => setShowInvite(false)} />}
    </div>
  );
};

export default ScreensPage;