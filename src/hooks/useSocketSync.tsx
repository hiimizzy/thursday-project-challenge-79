
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { initializeSocket, getSocket, socketEvents } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

interface SocketSyncOptions {
  room: string;
  entityType: 'project' | 'task' | 'company';
  entityId: string;
  onUpdate?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface OptimisticUpdate<T> {
  id: string;
  data: T;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}



export const useSocketSync = <T,>(options: SocketSyncOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate<T>[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { toast } = useToast();

  // Inicializar Socket.io
  useEffect(() => {
    const socketInstance = initializeSocket();
    setSocket(socketInstance);

    // Define event names here so they're available in cleanup
    const updateEvent = `${options.entityType}:updated`;
    const createEvent = `${options.entityType}:created`;
    const deleteEvent = `${options.entityType}:deleted`;

    if (socketInstance) {
      // Eventos de conexão
      socketInstance.on('connect', () => {
        console.log(`🔗 Conectado ao Socket.io para ${options.entityType}:${options.entityId}`);
        setIsConnected(true);
        
        // Entrar na sala específica
        socketInstance.emit(socketEvents.JOIN_ROOM, {
          room: options.room,
          entityType: options.entityType,
          entityId: options.entityId
        });
      });

      socketInstance.on('disconnect', () => {
        console.log(`🔌 Desconectado do Socket.io`);
        setIsConnected(false);
      });

      socketInstance.on(updateEvent, (data) => {
        console.log('📡 Atualização recebida via Socket.io:', data);
        
        const updateData = {
          id: Date.now().toString(),
          type: options.entityType,
          data: data,
          user: data.user || 'Outro usuário',
          event: 'UPDATE'
        };
        
        options.onUpdate?.(updateData);
        
        toast({
          title: "🔄 Atualização recebida",
          description: `Dados foram atualizados por ${data.user || 'outro usuário'}`,
        });
      });

      socketInstance.on(createEvent, (data) => {
        console.log('📡 Criação recebida via Socket.io:', data);
        options.onUpdate?.({
          id: Date.now().toString(),
          type: options.entityType,
          data: data,
          user: data.user || 'Outro usuário',
          event: 'CREATE'
        });
      });

      socketInstance.on(deleteEvent, (data) => {
        console.log('📡 Exclusão recebida via Socket.io:', data);
        options.onUpdate?.({
          id: Date.now().toString(),
          type: options.entityType,
          data: data,
          user: data.user || 'Outro usuário',
          event: 'DELETE'
        });
      });
    }

    return () => {
      if (socketInstance) {
        socketInstance.emit(socketEvents.LEAVE_ROOM, {
          room: options.room
        });
        socketInstance.off('connect');
        socketInstance.off('disconnect');
        socketInstance.off(updateEvent);
        socketInstance.off(createEvent);
        socketInstance.off(deleteEvent);
      }
    };
  }, [options.entityType, options.entityId, options.room]);

  // Atualização otimística com Socket.io
  const optimisticUpdate = useCallback(async (data: T, serverUpdate: () => Promise<T>) => {
    const updateId = Date.now().toString();
    
    // 1. Aplicar atualização imediatamente na UI
    const optimisticData: OptimisticUpdate<T> = {
      id: updateId,
      data,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    setOptimisticUpdates(prev => [...prev, optimisticData]);
    
    try {
      // 2. Enviar para o servidor via Socket.io
      const serverResponse = await serverUpdate();
      
      // 3. Emitir evento para outros clientes
      if (socket) {
        socket.emit(`${options.entityType}:update`, {
          entityId: options.entityId,
          data: serverResponse,
          user: 'Você',
          timestamp: Date.now()
        });
      }
      
      // 4. Confirmar sucesso
      setOptimisticUpdates(prev => 
        prev.map(update => 
          update.id === updateId 
            ? { ...update, status: 'confirmed' as const, data: serverResponse }
            : update
        )
      );
      
      // Limpar atualizações confirmadas
      setTimeout(() => {
        setOptimisticUpdates(prev => prev.filter(u => u.id !== updateId));
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro na sincronização via Socket.io:', error);
      
      // 4. Reverter em caso de erro
      setOptimisticUpdates(prev => 
        prev.map(update => 
          update.id === updateId 
            ? { ...update, status: 'failed' as const }
            : update
        )
      );
      
      toast({
        title: "❌ Erro ao sincronizar",
        description: "Suas alterações foram revertidas. Tente novamente.",
        variant: "destructive"
      });
      
      options.onError?.(error as Error);
      
      // Remover atualização falhada
      setTimeout(() => {
        setOptimisticUpdates(prev => prev.filter(u => u.id !== updateId));
      }, 3000);
    }
  }, [socket, toast, options.entityType, options.entityId, options.onError]);

  const emitUpdate = useCallback((eventType: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(eventType, {
        ...data,
        entityId: options.entityId,
        timestamp: Date.now()
      });
    }
  }, [socket, isConnected, options.entityId]);

  return {
    isConnected,
    optimisticUpdate,
    emitUpdate,
    socket,
    pendingUpdates: optimisticUpdates.filter(u => u.status === 'pending'),
    failedUpdates: optimisticUpdates.filter(u => u.status === 'failed')
  };
};
