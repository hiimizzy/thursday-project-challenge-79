
import { useState, useEffect, useMemo, useCallback } from 'react';
import { getSocket, socketEvents } from '@/lib/socket';

export type UserRole = 'admin' | 'member' | 'viewer';

export interface User {
  id: string;
  role: UserRole;
  companyId: string;
  email?: string;
  name?: string;
}

// Mock data para demonstração - substitua pela sua API
const mockUser: User = {
  id: 'user-1',
  role: 'admin',
  companyId: 'company-1',
  email: 'user@example.com',
  name: 'Usuário Teste'
};

export const usePermissions = (companyId: string) => {
  const [user, setUser] = useState<User | null>(mockUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUserPermissions = async () => {
      setIsLoading(true);
      
      try {
        // Aqui você faria uma chamada para sua API
        // const response = await fetch('/api/user/permissions');
        // const userData = await response.json();
        
        // Por enquanto, usando dados mock
        setUser(mockUser);

        // Conectar ao Socket.io para atualizações de permissões
        const socket = getSocket();
        if (socket) {
          socket.on('permissions:updated', (data) => {
            console.log('🔄 Permissões atualizadas via Socket.io');
            if (data.companyId === companyId) {
              setUser(prevUser => prevUser ? { ...prevUser, role: data.role } : null);
            }
          });
        }

      } catch (error) {
        console.error('❌ Erro ao carregar permissões do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPermissions();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('permissions:updated');
      }
    };
  }, [companyId]);

  const permissions = useMemo(() => {
    if (!user) {
      return {
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canManageProject: false,
        canCreateColumns: false,
        canDeleteColumns: false,
        canView: false
      };
    }

    const canEdit = user.role === 'admin' || user.role === 'member';
    const canDelete = user.role === 'admin';
    const canInvite = user.role === 'admin';
    const canManageProject = user.role === 'admin';
    const canCreateColumns = canEdit;
    const canDeleteColumns = user.role === 'admin';

    return {
      canEdit,
      canDelete,
      canInvite,
      canManageProject,
      canCreateColumns,
      canDeleteColumns,
      canView: true
    };
  }, [user]);

  const hasPermission = useCallback((permission: keyof typeof permissions) => {
    return permissions[permission];
  }, [permissions]);

  return {
    user,
    permissions,
    isLoading,
    hasPermission,
    role: user?.role || 'viewer'
  };
};
