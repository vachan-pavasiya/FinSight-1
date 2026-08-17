import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetAPI } from '../api/budget';

export function useBudget() {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({ 
    queryKey: ['budgets'], 
    queryFn: async () => { 
      const r = await budgetAPI.getBudgets(); 
      return r.data.data; 
    } 
  });
  
  const addMutation = useMutation({ 
    mutationFn: budgetAPI.createBudget, 
    onSuccess: () => queryClient.invalidateQueries(['budgets']) 
  });
  
  const deleteMutation = useMutation({ 
    mutationFn: budgetAPI.deleteBudget, 
    onSuccess: () => queryClient.invalidateQueries(['budgets']) 
  });
  
  return { 
    budgets: data || [], 
    isLoading, 
    addBudget: addMutation.mutate, 
    deleteBudget: deleteMutation.mutate, 
    isAdding: addMutation.isPending 
  };
}
