import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '[localhost](http://localhost:5000)';

class SocketService {
  socket = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinBoard(boardId) {
    this.socket?.emit('join-board', boardId);
  }

  leaveBoard(boardId) {
    this.socket?.emit('leave-board', boardId);
  }

  emitTaskUpdate(data) {
    this.socket?.emit('task-update', data);
  }

  emitTaskMove(data) {
    this.socket?.emit('task-move', data);
  }

  onTaskUpdated(callback) {
    this.socket?.on('task-updated', callback);
    return () => this.socket?.off('task-updated', callback);
  }

  onTaskMoved(callback) {
    this.socket?.on('task-moved', callback);
    return () => this.socket?.off('task-moved', callback);
  }
}

export const socketService = new SocketService();
