import { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API } from '../config';
import { formatDistanceToNow } from 'date-fns';

const ACCENT_COLORS = [
  '#7C3AED', '#2563EB', '#059669', '#D97706',
  '#DC2626', '#DB2777', '#0891B2', '#65A30D',
];

function getAccentColor(projectId) {
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = projectId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
}

function timeAgo(date) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
}

const ProjectCard = ({ project, currentUserId, onDelete, onRename, onDuplicate }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(project.name);

  const accent = getAccentColor(project._id);
  const isOwner = project.owner === currentUserId ||
    project.owner?._id === currentUserId ||
    String(project.owner) === String(currentUserId);

  // Stacked members: owner + up to 3 members
  const allMembers = [
    { userId: project.owner, isOwner: true },
    ...(project.members || []).slice(0, 3),
  ];

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setMenuOpen(o => !o);
  };

  const handleRename = async (e) => {
    e.stopPropagation();
    if (!newName.trim() || newName === project.name) {
      setRenaming(false);
      return;
    }
    try {
      await axios.patch(`${API}/api/projects/${project._id}/rename`, { name: newName.trim() });
      onRename(project._id, newName.trim());
      toast.success('Renamed!');
    } catch {
      toast.error('Failed to rename');
    }
    setRenaming(false);
    setMenuOpen(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/api/projects/${project._id}`);
      onDelete(project._id);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete');
    }
    setMenuOpen(false);
  };

  const handleDuplicate = async (e) => {
    e.stopPropagation();
    try {
      const res = await axios.post(`${API}/api/projects/${project._id}/duplicate`);
      onDuplicate(res.data);
      toast.success('Project duplicated!');
    } catch {
      toast.error('Failed to duplicate');
    }
    setMenuOpen(false);
  };

  return (
    <div className="relative group">
      <button
        className="w-full text-left grid grid-flow-row bg-bc border-2 border-sc rounded-xl overflow-hidden hover:border-pm transition"
        style={{ '--accent': accent }}
        onClick={() => navigate(`/project/${project._id}`)}
      >
        {/* Color accent bar */}
        <div className="w-full h-1" style={{ backgroundColor: accent }} />

        {/* Card body */}
        <div className="px-3 pt-3 pb-3 flex flex-col gap-3">
          {/* Project name */}
          {renaming ? (
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(e); if (e.key === 'Escape') { setRenaming(false); setNewName(project.name); } }}
              onClick={e => e.stopPropagation()}
              className="bg-bc border border-pm rounded-lg px-2 py-1 text-white text-sm focus:outline-none w-full"
            />
          ) : (
            <h3 className="text-white font-medium text-sm truncate">{project.name}</h3>
          )}

          {/* Thumbnail placeholder */}
          <div className="w-full h-16 rounded-lg opacity-40" style={{ backgroundColor: accent }} />

          {/* Footer: avatars + time */}
          <div className="flex items-center justify-between">
            {/* Stacked member avatars */}
            <div className="flex -space-x-2">
              {allMembers.map((m, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-bc flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: ACCENT_COLORS[(i + 2) % ACCENT_COLORS.length], zIndex: allMembers.length - i }}
                  title={m.isOwner ? 'Owner' : `Member`}
                >
                  {m.isOwner ? '★' : '•'}
                </div>
              ))}
              {project.members?.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-bc bg-sc flex items-center justify-center text-gray-400 text-xs">
                  +{project.members.length - 3}
                </div>
              )}
            </div>

            {/* Last edited */}
            <span className="text-gray-600 text-xs">
              {timeAgo(project.updatedAt)}
            </span>
          </div>
        </div>
      </button>

      {/* 3-dot menu button — shows on hover */}
      {isOwner && (
        <div className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 transition z-10">
          <button
            onClick={handleMenuClick}
            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-sc transition"
          >
            ···
          </button>

          {menuOpen && (
            <>
              {/* Backdrop to close menu */}
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
              <div className="absolute right-0 top-7 w-36 bg-[#1a1a1a] border border-sc rounded-xl shadow-2xl py-1 z-20 overflow-hidden">
                <button
                  onClick={(e) => { e.stopPropagation(); setRenaming(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-gray-200 hover:bg-sc text-sm"
                >
                  Rename
                </button>
                <button
                  onClick={handleDuplicate}
                  className="w-full text-left px-4 py-2 text-gray-200 hover:bg-sc text-sm"
                >
                  Duplicate
                </button>
                <div className="border-t border-sc my-1" />
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-sc text-sm"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectCard;