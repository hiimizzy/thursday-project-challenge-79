
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useAutoSave = (data: any, onSave: (data: any) => void, delay: number = 2000) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSave(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay]);

  return {
    isSaving: Boolean(timeoutRef.current)
  };
};
