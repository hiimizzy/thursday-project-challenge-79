
import { io, Socket } from 'socket.io-client';

// Socket.io client configuration
const SOCKET_URL = 'ws://localhost:3001'; // Altere para seu servidor Socket.io

let socket: Socket | null = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('🔗 Conectado ao servidor Socket.io');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Desconectado do servidor Socket.io');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão Socket.io:', error);
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Eventos personalizados para sincronização
export const socketEvents = {
  // Projetos
  PROJECT_CREATED: 'project:created',
  PROJECT_UPDATED: 'project:updated',
  PROJECT_DELETED: 'project:deleted',
  
  // Tarefas
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  
  // Colunas
  COLUMN_CREATED: 'column:created',
  COLUMN_UPDATED: 'column:updated',
  COLUMN_DELETED: 'column:deleted',
  
  // Usuários
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  
  // Salas
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave'
};

export default socket;
