
import { io, Socket } from 'socket.io-client';

// Socket.io client configuration
const SOCKET_URL = 'https://localhost:3001'; // Altere para seu servidor Socket.io



let socket: Socket | null = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
      path: '/socket.io',
      secure: false
    });

    // Eventos de conexão

    socket.on('connect', () => {
      console.log('🔗 Conectado ao servidor Socket.io');
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Desconectado do servidor Socket.io',reason);
      if(reason === 'io server disconnect'){

        socket?.connect
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão Socket.io:', error.message);

      setTimeout(() => {
        if(socket && !socket.connected){
          socket.io.opts.transports = ['polling','websocket'];

          socket.connect();
        }
      },1000);

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
