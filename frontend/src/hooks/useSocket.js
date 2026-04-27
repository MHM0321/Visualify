import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = 'http://192.168.10.6:5001';

export function useSocket({ screenId, userId, name, role }) {
  const socketRef = useRef(null);
  const [viewers, setViewers] = useState([]);
  const [editor, setEditor] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (!screenId || !userId) return;

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('screen:join', { screenId, userId, name, role });
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

    return () => {
      socket.emit('screen:leave', { screenId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [screenId, userId, name, role]);

  // Expose socket ref so useCanvas can emit + listen directly
  return { viewers, editor, canEdit, socketRef };
}