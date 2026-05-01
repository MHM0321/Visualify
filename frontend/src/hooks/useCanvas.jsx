import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { API } from '../config';

export const CONNECTOR_TYPES = new Set(['line', 'arrow-one', 'arrow-both', 'dotted']);
export const CONTAINER_TYPES = new Set(['rectangle', 'ellipse', 'rect-1partition', 'rect-2partition', 'rect-1row', 'rect-2rows', 'imagebox', 'textbox']);

const DEFAULT_PROPS = {
  rectangle:         { width: 160, height: 100, fill: 'transparent', borderColor: '#ffffff', borderWidth: 2, radius: 4 },
  ellipse:           { width: 160, height: 100, fill: 'transparent', borderColor: '#ffffff', borderWidth: 2 },
  'rect-1partition': { width: 160, height: 100, fill: 'transparent', borderColor: '#ffffff', borderWidth: 2, radius: 4 },
  'rect-2partition': { width: 160, height: 100, fill: 'transparent', borderColor: '#ffffff', borderWidth: 2, radius: 4 },
  'rect-1row':       { width: 160, height: 100, fill: 'transparent', borderColor: '#ffffff', borderWidth: 2, radius: 4 },
  'rect-2rows':      { width: 160, height: 100, fill: 'transparent', borderColor: '#ffffff', borderWidth: 2, radius: 4 },
  line:              { color: '#ffffff', strokeWidth: 2 },
  'arrow-one':       { color: '#ffffff', strokeWidth: 2 },
  'arrow-both':      { color: '#ffffff', strokeWidth: 2 },
  dotted:            { color: '#ffffff', strokeWidth: 2 },
  textbox:           { width: 160, height: 60, text: 'Text', color: '#ffffff', fontSize: 16, fontFamily: 'sans-serif', align: 'left' },
  imagebox:          { width: 160, height: 120, fill: 'transparent', borderColor: '#ffffff', borderWidth: 2, imageData: null, objectFit: 'contain' },
  pen:               { color: '#ffffff', strokeWidth: 2, points: [] },
};

export function useCanvas(screenId, isReadOnly = false, socketRef = null) {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const saveTimer = useRef(null);
  // Flag to prevent re-broadcasting changes we just received from the socket
  const isApplyingRemote = useRef(false);

  // ── Auto-save to DB ──────────────────────────────────────────────────────────
  const autoSave = useCallback((els) => {
    if (!screenId || isReadOnly) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await axios.patch(`${API}/api/screens/${screenId}`, { content: { elements: els } });
      } catch (e) {
        console.error('Auto-save failed', e);
      }
    }, 800);
  }, [screenId, isReadOnly]);

  // ── Broadcast to other clients via socket ────────────────────────────────────
  const broadcastTimer = useRef(null);
  const broadcast = useCallback((els) => {
    if (!socketRef?.current || isReadOnly) return;
    // Throttle to ~30fps to avoid flooding
    clearTimeout(broadcastTimer.current);
    broadcastTimer.current = setTimeout(() => {
      socketRef.current.emit('canvas:update', { screenId, elements: els });
    }, 32);
  }, [socketRef, screenId, isReadOnly]);

  // ── Listen for remote canvas updates ────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const handleRemoteUpdate = ({ elements: remoteEls }) => {
      isApplyingRemote.current = true;
      setElements(remoteEls);
      isApplyingRemote.current = false;
    };

    socket.on('canvas:update', handleRemoteUpdate);
    return () => socket.off('canvas:update', handleRemoteUpdate);
  }, [socketRef?.current]); // re-subscribe when socket connects

  // ── Combined apply: save + broadcast ────────────────────────────────────────
  const apply = useCallback((els) => {
    autoSave(els);
    if (!isApplyingRemote.current) broadcast(els);
  }, [autoSave, broadcast]);

  // ── Public API ───────────────────────────────────────────────────────────────

  const loadElements = useCallback((content) => {
    setElements(content?.elements ?? []);
    setSelectedId(null);
  }, []);

  const addElement = useCallback((type, x, y) => {
    const el = {
      id: `${type}-${Date.now()}`,
      type, x, y,
      props: { ...DEFAULT_PROPS[type] },
    };
    setElements(prev => {
      const next = [...prev, el];
      apply(next);
      return next;
    });
    setSelectedId(el.id);
    return el.id;
  }, [apply]);

  const addConnector = useCallback((type, fromId, fromAnchor, toId, toAnchor) => {
    const el = {
      id: `${type}-${Date.now()}`,
      type, fromId, fromAnchor, toId, toAnchor,
      props: { ...DEFAULT_PROPS[type] },
    };
    setElements(prev => {
      const next = [...prev, el];
      apply(next);
      return next;
    });
    setSelectedId(el.id);
    return el.id;
  }, [apply]);

  const moveElement = useCallback((id, x, y) => {
    setElements(prev => {
      const next = prev.map(el => el.id === id ? { ...el, x, y } : el);
      apply(next);
      return next;
    });
  }, [apply]);

  const updateProps = useCallback((id, patch) => {
    setElements(prev => {
      const next = prev.map(el =>
        el.id === id ? { ...el, props: { ...el.props, ...patch } } : el
      );
      apply(next);
      return next;
    });
  }, [apply]);

  const deleteElement = useCallback((id) => {
    setElements(prev => {
      const next = prev.filter(el => el.id !== id && el.fromId !== id && el.toId !== id);
      apply(next);
      return next;
    });
    setSelectedId(null);
  }, [apply]);

  const selectedElement = elements.find(el => el.id === selectedId) ?? null;

  return {
    elements, selectedId, selectedElement,
    setSelectedId, loadElements,
    addElement, addConnector, moveElement, updateProps, deleteElement,
  };
}