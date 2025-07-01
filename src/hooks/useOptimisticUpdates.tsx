
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface OptimisticAction {
  id: string;
  type: 'update' | 'create' | 'delete';
  data: any;
  rollback: () => void;
}

export const useOptimisticUpdates = () => {
  const [pendingActions, setPendingActions] = useState<OptimisticAction[]>([]);
  const { toast } = useToast();

  const addOptimisticAction = useCallback((action: OptimisticAction) => {
    setPendingActions(prev => [...prev, action]);
    
    // Simular chamada para servidor
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        setPendingActions(prev => prev.filter(a => a.id !== action.id));
        toast({
          title: "✅ Salvo automaticamente",
          description: "Suas alterações foram sincronizadas.",
        });
      } else {
        // Reverter em caso de falha
        action.rollback();
        setPendingActions(prev => prev.filter(a => a.id !== action.id));
        toast({
          title: "❌ Erro ao salvar",
          description: "Revertendo alterações. Tente novamente.",
          variant: "destructive",
        });
      }
    }, 1000 + Math.random() * 2000); // 1-3s delay
  }, [toast]);

  return {
    pendingActions,
    addOptimisticAction,
    hasPendingActions: pendingActions.length > 0
  };
};
