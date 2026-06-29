const THEMES = [
  // ── Original themes ──────────────────────────────────────────────────────────
  { id: 'midnight',   label: 'Midnight',   pm: '#4a5878', sc: '#3D3D3D', bc: '#2c2c2c' },
  { id: 'obsidian',   label: 'Obsidian',   pm: '#6366f1', sc: '#27272a', bc: '#18181b' },
  { id: 'slate',      label: 'Slate',      pm: '#3b82f6', sc: '#334155', bc: '#0f172a' },
  { id: 'emerald',    label: 'Emerald',    pm: '#10b981', sc: '#374151', bc: '#111827' },
  { id: 'rose',       label: 'Rose',       pm: '#f43f5e', sc: '#3f3f46', bc: '#1c1c1e' },
  { id: 'sandstone',  label: 'Sandstone',  pm: '#d97706', sc: '#44403c', bc: '#292524' },
  { id: 'pure-dark',  label: 'Pure Dark',  pm: '#ffffff', sc: '#2a2a2a', bc: '#141414' },
  { id: 'arctic',     label: 'Arctic',     pm: '#0ea5e9', sc: '#cbd5e1', bc: '#f0f4f8' },
  { id: 'paper',      label: 'Paper',      pm: '#8b5cf6', sc: '#e5e7eb', bc: '#fafafa' },

  // ── New dark themes ──────────────────────────────────────────────────────────
  { id: 'abyss',      label: 'Abyss',      pm: '#22d3ee', sc: '#1e293b', bc: '#020617' },
  { id: 'crimson',    label: 'Crimson',    pm: '#fb7185', sc: '#3b1e26', bc: '#1a0a10' },
  { id: 'forest',     label: 'Forest',     pm: '#4ade80', sc: '#1c3a28', bc: '#0d1f16' },
  { id: 'dracula',    label: 'Dracula',    pm: '#bd93f9', sc: '#44475a', bc: '#282a36' },
  { id: 'mocha',      label: 'Mocha',      pm: '#f38ba8', sc: '#45475a', bc: '#1e1e2e' },
  { id: 'nord',       label: 'Nord',       pm: '#88c0d0', sc: '#3b4252', bc: '#2e3440' },
  { id: 'volcano',    label: 'Volcano',    pm: '#fb923c', sc: '#431407', bc: '#1c0a04' },
  { id: 'midnight-blue', label: 'M. Blue', pm: '#818cf8', sc: '#1e2749', bc: '#0f1730' },
  { id: 'graphite',   label: 'Graphite',   pm: '#a78bfa', sc: '#374151', bc: '#1f2937' },
  { id: 'ocean',      label: 'Ocean',      pm: '#06b6d4', sc: '#164e63', bc: '#083344' },

  // ── New light themes ────────────────────────────────────────────────────────
  { id: 'latte',      label: 'Latte',      pm: '#7c3aed', sc: '#d4c5f5', bc: '#f5f0ff' },
  { id: 'dawn',       label: 'Dawn',       pm: '#0284c7', sc: '#bae6fd', bc: '#f0f9ff' },
  { id: 'sakura',     label: 'Sakura',     pm: '#be185d', sc: '#fbcfe8', bc: '#fff1f5' },
  { id: 'mint',       label: 'Mint',       pm: '#059669', sc: '#a7f3d0', bc: '#ecfdf5' },
  { id: 'clay',       label: 'Clay',       pm: '#b45309', sc: '#fcd34d', bc: '#fefce8' },
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