import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

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
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const { toast } = useToast();

  // Configurar sincronização em tempo real com Supabase
  useEffect(() => {
    const channelName = `${options.entityType}-${options.entityId}`;
    console.log(`🔗 Conectando ao canal: ${channelName}`);

    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: options.entityType === 'project' ? 'projects' : 
                 options.entityType === 'task' ? 'tasks' : 'companies',
          filter: `id=eq.${options.entityId}`
        },
        (payload) => {
          console.log('📡 Atualização em tempo real recebida:', payload);
          
          const updateData = {
            id: Date.now().toString(),
            type: options.entityType,
            data: payload.new || payload.old,
            user: 'Outro usuário',
            event: payload.eventType
          };
          
          options.onUpdate?.(updateData);
          
          if (payload.eventType !== 'INSERT') {
            toast({
              title: "🔄 Atualização recebida",
              description: `Dados foram atualizados por outro usuário`,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Status da conexão: ${status}`);
        setIsConnected(status === 'SUBSCRIBED');
      });

    setChannel(realtimeChannel);

    return () => {
      console.log(`🔌 Desconectando do canal: ${channelName}`);
      realtimeChannel.unsubscribe();
      setIsConnected(false);
    };
  }, [options.entityType, options.entityId]);

  // Atualização otimística com Supabase
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
      // 2. Enviar para o Supabase
      const serverResponse = await serverUpdate();
      
      // 3. Confirmar sucesso
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
      console.error('❌ Erro na sincronização:', error);
      
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
  }, [toast, options.onError]);

  return {
    isConnected,
    optimisticUpdate,
    pendingUpdates: optimisticUpdates.filter(u => u.status === 'pending'),
    failedUpdates: optimisticUpdates.filter(u => u.status === 'failed')
  };
};

// Hook para verificação de permissões em tempo real com Supabase
export const usePermissions = (companyId: string, userId?: string) => {
  const [permissions, setPermissions] = useState({
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canInviteMembers: false,
    canManageCompany: false,
    role: 'viewer' as 'admin' | 'member' | 'viewer'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      return user;
    };

    const loadPermissions = async () => {
      setIsLoading(true);
      
      try {
        const currentUser = await getUser();
        if (!currentUser) {
          setIsLoading(false);
          return;
        }

        // Buscar permissões do usuário na empresa
        const { data: memberData, error } = await supabase
          .from('company_members')
          .select('role, permissions')
          .eq('company_id', companyId)
          .eq('user_id', currentUser.id)
          .single();

        if (error) {
          console.error('❌ Erro ao carregar permissões:', error);
          setIsLoading(false);
          return;
        }

        // Definir permissões baseadas no papel
        const userRole = memberData?.role || 'viewer';
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

    // Escutar mudanças nas permissões em tempo real
    const channel = supabase
      .channel(`company-permissions-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_members',
          filter: `company_id=eq.${companyId}`
        },
        () => {
          console.log('🔄 Permissões atualizadas, recarregando...');
          loadPermissions();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
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
