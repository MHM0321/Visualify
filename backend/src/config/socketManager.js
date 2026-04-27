/**
 * socketManager.js
 * 
 * Rooms are keyed by screenId.
 * Each room tracks:
 *   - viewers: Map<socketId, { userId, name }>
 *   - editorSocketId: string | null  (the one socket that holds the edit lock)
 */

const rooms = new Map();
// roomId -> { viewers: Map<socketId, {userId, name}>, editorSocketId: string|null }

function getRoom(screenId) {
  if (!rooms.has(screenId)) {
    rooms.set(screenId, { viewers: new Map(), editorSocketId: null });
  }
  return rooms.get(screenId);
}

function broadcastPresence(io, screenId) {
  const room = getRoom(screenId);
  const viewerList = Array.from(room.viewers.values());
  const editorSocketId = room.editorSocketId;
  const editorInfo = editorSocketId ? room.viewers.get(editorSocketId) : null;
  io.to(screenId).emit('presence:update', {
    viewers: viewerList,
    editor: editorInfo ?? null,
  });
}

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {

    // Client joins a screen room
    // payload: { screenId, userId, name, role }
    socket.on('screen:join', ({ screenId, userId, name, role }) => {
      socket.join(screenId);
      socket.data.screenId = screenId;
      socket.data.userId = userId;
      socket.data.name = name;
      socket.data.role = role;

      const room = getRoom(screenId);
      room.viewers.set(socket.id, { userId, name });

      // Try to claim edit lock if editor and no one else is editing
      let canEdit = false;
      if (role === 'editor' && room.editorSocketId === null) {
        room.editorSocketId = socket.id;
        canEdit = true;
      }

      // Tell this socket whether it can edit
      socket.emit('edit:status', { canEdit });

      broadcastPresence(io, screenId);
    });

    // Editor broadcasts canvas changes — relay to everyone else in the room
    socket.on('canvas:update', ({ screenId, elements }) => {
      // Only the active editor should be broadcasting
      const room = rooms.get(screenId);
      if (!room || room.editorSocketId !== socket.id) return;
      // Broadcast to everyone in the room EXCEPT the sender
      socket.to(screenId).emit('canvas:update', { elements });
    });

    // Client leaves a screen (explicit)
    socket.on('screen:leave', ({ screenId }) => {
      handleLeave(io, socket, screenId);
    });

    // On disconnect, clean up automatically
    socket.on('disconnect', () => {
      const screenId = socket.data.screenId;
      if (screenId) handleLeave(io, socket, screenId);
    });
  });
}

function handleLeave(io, socket, screenId) {
  const room = rooms.get(screenId);
  if (!room) return;

  room.viewers.delete(socket.id);

  // Release edit lock if this socket held it
  if (room.editorSocketId === socket.id) {
    room.editorSocketId = null;

    // Promote another editor in the room if any
    for (const [sid, info] of room.viewers.entries()) {
      const clientSocket = io.sockets.sockets.get(sid);
      if (clientSocket && clientSocket.data.role === 'editor') {
        room.editorSocketId = sid;
        clientSocket.emit('edit:status', { canEdit: true });
        break;
      }
    }
  }

  // Clean up empty rooms
  if (room.viewers.size === 0) {
    rooms.delete(screenId);
  } else {
    broadcastPresence(io, screenId);
  }

  socket.leave(screenId);
}