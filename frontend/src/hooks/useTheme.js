const THEMES = [
  { id: 'midnight', label: 'Midnight', pm: '#4a5878', sc: '#3D3D3D', bc: '#2c2c2c' },
  { id: 'obsidian', label: 'Obsidian', pm: '#6366f1', sc: '#27272a', bc: '#18181b' },
  { id: 'slate',    label: 'Slate',    pm: '#3b82f6', sc: '#334155', bc: '#0f172a' },
  { id: 'emerald',  label: 'Emerald',  pm: '#10b981', sc: '#374151', bc: '#111827' },
  { id: 'rose',     label: 'Rose',     pm: '#f43f5e', sc: '#3f3f46', bc: '#1c1c1e' },
  { id: 'sandstone',label: 'Sandstone',pm: '#d97706', sc: '#44403c', bc: '#292524' },
  { id: 'pure-dark',label: 'Pure Dark',pm: '#ffffff', sc: '#2a2a2a', bc: '#141414' },
  { id: 'arctic',   label: 'Arctic',   pm: '#0ea5e9', sc: '#cbd5e1', bc: '#f0f4f8' },
  { id: 'paper',    label: 'Paper',    pm: '#8b5cf6', sc: '#e5e7eb', bc: '#fafafa' },
];

export function useTheme() {
  const getTheme = () => localStorage.getItem('theme') || 'midnight';

  const applyTheme = (themeId) => {
    document.documentElement.setAttribute('data-theme', themeId === 'midnight' ? '' : themeId);
    localStorage.setItem('theme', themeId);
  };

  const initTheme = () => {
    const saved = getTheme();
    applyTheme(saved);
  };

  return { themes: THEMES, getTheme, applyTheme, initTheme };
}