import React, { useEffect, useState, useMemo } from 'react';
import axios from "axios";
import NavBar from '../components/NavBar';
import ProjectCard from '../components/ProjectCard';
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import { API } from '../config';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recent' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'alpha', label: 'A → Z' },
];

function sortProjects(projects, sort) {
  const arr = [...projects];
  if (sort === 'recent') return arr.sort((a, b) => new Date(b.lastEditedAt || b.updatedAt) - new Date(a.lastEditedAt || a.updatedAt));
  if (sort === 'oldest') return arr.sort((a, b) => new Date(a.lastEditedAt || a.updatedAt) - new Date(b.lastEditedAt || b.updatedAt));
  if (sort === 'alpha') return arr.sort((a, b) => a.name.localeCompare(b.name));
  return arr;
}

const EmptyState = ({ message, onAdd }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="48" height="36" rx="4" stroke="#3D3D3D" strokeWidth="2.5"/>
      <rect x="16" y="20" width="14" height="14" rx="2" stroke="#3D3D3D" strokeWidth="2"/>
      <line x1="36" y1="23" x2="48" y2="23" stroke="#3D3D3D" strokeWidth="2" strokeLinecap="round"/>
      <line x1="36" y1="29" x2="44" y2="29" stroke="#3D3D3D" strokeWidth="2" strokeLinecap="round"/>
      <line x1="20" y1="40" x2="44" y2="40" stroke="#3D3D3D" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="32" cy="52" r="3" fill="#3D3D3D"/>
      <line x1="32" y1="48" x2="32" y2="44" stroke="#3D3D3D" strokeWidth="2"/>
    </svg>
    <p className="text-gray-600 text-sm">{message}</p>
    {onAdd && (
      <button
        onClick={onAdd}
        className="mt-2 bg-pm text-white rounded-xl px-6 py-2.5 text-sm hover:opacity-90 transition"
      >
        + New Project
      </button>
    )}
  </div>
);

const SectionHeader = ({ title, count }) => (
  <div className="flex items-center gap-3 mb-5">
    <h2 className="text-white font-semibold text-sm uppercase tracking-widest">{title}</h2>
    <span className="text-gray-600 text-xs bg-sc px-2 py-0.5 rounded-full">{count}</span>
    <div className="flex-1 h-px bg-sc" />
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userId = decoded.id || decoded.sub;

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [view, setView] = useState('grid'); // 'grid' | 'list'

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API}/api/projects/${userId}`);
        setProjects(res.data);
      } catch (error) {
        console.log("Error fetching projects");
      }
    };
    fetchProjects();
  }, []);

  const handleDelete = (projectId) => setProjects(prev => prev.filter(p => p._id !== projectId));
  const handleRename = (projectId, newName) => setProjects(prev => prev.map(p => p._id === projectId ? { ...p, name: newName } : p));
  const handleDuplicate = (newProject) => setProjects(prev => [newProject, ...prev]);

  // Split into owned vs shared
  const myProjects = useMemo(() => {
    const filtered = projects.filter(p => {
      const ownerId = p.owner?._id ?? p.owner;
      return String(ownerId) === String(userId);
    });
    const searched = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    return sortProjects(searched, sort);
  }, [projects, userId, search, sort]);

  const sharedProjects = useMemo(() => {
    const filtered = projects.filter(p => {
      const ownerId = p.owner?._id ?? p.owner;
      return String(ownerId) !== String(userId);
    });
    const searched = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    return sortProjects(searched, sort);
  }, [projects, userId, search, sort]);

  const gridClass = view === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6'
    : 'flex flex-col gap-3';

  const cardProps = (project) => ({
    key: project._id,
    project,
    currentUserId: userId,
    onDelete: handleDelete,
    onRename: handleRename,
    onDuplicate: handleDuplicate,
    listView: view === 'list',
  });

  return (
    <div className="bg-bc min-h-screen">
      <NavBar />
      <div className="px-10 py-8">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-10">

          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-bc border border-sc rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-pm"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-bc border border-sc rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-pm cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Grid / List toggle */}
          <div className="flex items-center border border-sc rounded-xl overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2.5 transition ${view === 'grid' ? 'bg-sc text-white' : 'text-gray-500 hover:text-white'}`}
              title="Grid view"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2.5 transition ${view === 'list' ? 'bg-sc text-white' : 'text-gray-500 hover:text-white'}`}
              title="List view"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>

          {/* New project button */}
          <button
            onClick={() => navigate("/create-project")}
            className="flex items-center gap-2 bg-pm text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition ml-auto"
          >
            <span className="text-lg leading-none">+</span> New Project
          </button>
        </div>

        {/* My Projects */}
        <div className="mb-12">
          <SectionHeader title="My Projects" count={myProjects.length} />
          {myProjects.length === 0 ? (
            <EmptyState
              message={search ? "No projects match your search." : "You haven't created any projects yet."}
              onAdd={!search ? () => navigate('/create-project') : null}
            />
          ) : (
            <div className={gridClass}>
              {myProjects.map(project => (
                <ProjectCard {...cardProps(project)} />
              ))}
            </div>
          )}
        </div>

        {/* Shared with me */}
        {(sharedProjects.length > 0 || search) && (
          <div>
            <SectionHeader title="Shared with me" count={sharedProjects.length} />
            {sharedProjects.length === 0 ? (
              <EmptyState message="No shared projects match your search." />
            ) : (
              <div className={gridClass}>
                {sharedProjects.map(project => (
                  <ProjectCard {...cardProps(project)} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default HomePage;