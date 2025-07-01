
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { initializeSocket, getSocket, socketEvents } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

interface RealtimeHookOptions {
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

export const useRealtimeSync = <T,>(options: RealtimeHookOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate<T>[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { toast } = useToast();

  // Configurar sincronização em tempo real com Socket.io
  useEffect(() => {
    const socketInstance = initializeSocket();
    setSocket(socketInstance);
    
    console.log(`🔗 Conectando via Socket.io: ${options.entityType}-${options.entityId}`);

    // Define event names here so they're available in cleanup
    const updateEvent = `${options.entityType}:updated`;
    const createEvent = `${options.entityType}:created`;
    const deleteEvent = `${options.entityType}:deleted`;

    if (socketInstance) {
      socketInstance.on('connect', () => {
        console.log(`📡 Conectado via Socket.io`);
        setIsConnected(true);

        // Entrar na sala específica
        socketInstance.emit(socketEvents.JOIN_ROOM, {
          room: `${options.entityType}-${options.entityId}`,
          entityType: options.entityType,
          entityId: options.entityId
        });
      });

      socketInstance.on('disconnect', () => {
        console.log(`🔌 Desconectado do Socket.io`);
        setIsConnected(false);
      });

      socketInstance.on(updateEvent, (payload) => {
        console.log('📡 Atualização em tempo real recebida via Socket.io:', payload);
        
        const updateData = {
          id: Date.now().toString(),
          type: options.entityType,
          data: payload.data,
          user: payload.user || 'Outro usuário',
          event: 'UPDATE'
        };
        
        options.onUpdate?.(updateData);
        
        toast({
          title: "🔄 Atualização recebida",
          description: `Dados foram atualizados por ${payload.user || 'outro usuário'}`,
        });
      });

      socketInstance.on(createEvent, (payload) => {
        console.log('📡 Criação recebida via Socket.io:', payload);
        options.onUpdate?.({
          id: Date.now().toString(),
          type: options.entityType,
          data: payload.data,
          user: payload.user || 'Outro usuário',
          event: 'CREATE'
        });
      });

      socketInstance.on(deleteEvent, (payload) => {
        console.log('📡 Exclusão recebida via Socket.io:', payload);
        options.onUpdate?.({
          id: Date.now().toString(),
          type: options.entityType,
          data: payload.data,
          user: payload.user || 'Outro usuário',
          event: 'DELETE'
        });
      });
    }

    return () => {
      if (socketInstance) {
        console.log(`🔌 Desconectando do Socket.io: ${options.entityType}-${options.entityId}`);
        
        socketInstance.emit(socketEvents.LEAVE_ROOM, {
          room: `${options.entityType}-${options.entityId}`
        });
        
        socketInstance.off('connect');
        socketInstance.off('disconnect');
        socketInstance.off(updateEvent);
        socketInstance.off(createEvent);
        socketInstance.off(deleteEvent);
      }
    };
  }, [options.entityType, options.entityId]);

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
      // 2. Enviar para o servidor
      const serverResponse = await serverUpdate();
      
      // 3. Emitir evento via Socket.io para outros clientes
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

  return {
    isConnected,
    optimisticUpdate,
    pendingUpdates: optimisticUpdates.filter(u => u.status === 'pending'),
    failedUpdates: optimisticUpdates.filter(u => u.status === 'failed')
  };
};

// Hook para verificação de permissões em tempo real com Socket.io
export const usePermissions = (companyId: string, userId?: string) => {
  const [permissions, setPermissions] = useState({
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canInviteMembers: false,
    canManageCompany: false,
    role: 'viewer' as 'admin' | 'member' | 'viewer'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>({
    id: 'user-1',
    email: 'user@example.com',
    name: 'Usuário Teste'
  });

  useEffect(() => {
    const loadPermissions = async () => {
      setIsLoading(true);
      
      try {
        // Mock data - substitua pela sua API
        const userRole = 'admin';
        const newPermissions = {
          canCreateProjects: userRole === 'admin' || userRole === 'member',
          canEditProjects: userRole === 'admin' || userRole === 'member',
          canDeleteProjects: userRole === 'admin',
          canInviteMembers: userRole === 'admin',
          canManageCompany: userRole === 'admin',
          role: userRole as 'admin' | 'member' | 'viewer'
        };
        
        setPermissions(newPermissions);
        console.log('🔐 Permissões carregadas:', newPermissions);
        
      } catch (error) {
        console.error('❌ Erro ao carregar permissões:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();

    // Escutar mudanças nas permissões via Socket.io
    const socket = getSocket();
    if (socket) {
      socket.on('permissions:updated', (data) => {
        console.log('🔄 Permissões atualizadas via Socket.io, recarregando...');
        if (data.companyId === companyId) {
          loadPermissions();
        }
      });

      return () => {
        socket.off('permissions:updated');
      };
    }
  }, [companyId]);

  const hasPermission = useCallback((action: keyof typeof permissions) => {
    return permissions[action] === true;
  }, [permissions]);

  return {
    permissions,
    isLoading,
    hasPermission,
    role: permissions.role,
    user
  };
};
