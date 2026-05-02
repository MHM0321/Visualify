import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { API } from '../config';

export function useSocket({ screenId, userId, name, role, projectId }) {
  const socketRef = useRef(null);
  const [viewers, setViewers] = useState([]);
  const [editor, setEditor] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [newScreen, setNewScreen] = useState(null);

  useEffect(() => {
    if (!screenId || !userId || !role) return;  // wait until role is known

    const socket = io(API, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('screen:join', { screenId, userId, name, role, projectId });
    });

    socket.on('edit:status', ({ canEdit: ce }) => {
      setCanEdit(ce);
      if (!ce && role === 'editor') {
        toast('Someone else is editing. You are in view-only mode.', {
          icon: '👁️', duration: 4000,
        });
      }
    });

    socket.on('presence:update', ({ viewers: v, editor: e }) => {
      setViewers(v);
      setEditor(e);
    });

    socket.on('screen:created', ({ screen }) => {
      setNewScreen(screen);
    });

    return () => {
      socket.emit('screen:leave', { screenId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [screenId, userId, name, role]);

  // Expose socket ref so useCanvas can emit + listen directly
  const emitScreenCreated = (screen) => {
    socketRef.current?.emit('screen:created', { screen });
  };

  return { viewers, editor, canEdit, socketRef, newScreen, emitScreenCreated };
}