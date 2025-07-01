import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'member' | 'viewer';

export interface User {
  id: string;
  role: UserRole;
  companyId: string;
  email?: string;
  name?: string;
}

export const usePermissions = (companyId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserPermissions = async () => {
      setIsLoading(true);
      
      try {
        // Obter usuário atual
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          setIsLoading(false);
          return;
        }

        // Buscar papel do usuário na empresa
        const { data: memberData, error } = await supabase
          .from('company_members')
          .select(`
            role,
            companies!inner(id, name)
          `)
          .eq('company_id', companyId)
          .eq('user_id', authUser.id)
          .single();

        if (error) {
          console.error('❌ Erro ao carregar dados do usuário:', error);
          // Usuário pode não ser membro desta empresa
          setUser({
            id: authUser.id,
            role: 'viewer',
            companyId,
            email: authUser.email,
            name: authUser.user_metadata?.name
          });
        } else {
          setUser({
            id: authUser.id,
            role: memberData.role as UserRole,
            companyId,
            email: authUser.email,
            name: authUser.user_metadata?.name
          });
        }

      } catch (error) {
        console.error('❌ Erro ao carregar permissões do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPermissions();

    // Escutar mudanças em tempo real
    const channel = supabase
      .channel(`user-permissions-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_members',
          filter: `company_id=eq.${companyId}`
        },
        () => {
          console.log('🔄 Permissões do usuário atualizadas');
          loadUserPermissions();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
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
      canView: true // todos podem visualizar se chegaram até aqui
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
