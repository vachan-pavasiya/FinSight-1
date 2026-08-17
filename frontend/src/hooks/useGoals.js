import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsAPI } from '../api/goals';

export function useGoals() {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({ 
    queryKey: ['goals'], 
    queryFn: async () => { 
      const r = await goalsAPI.getGoals(); 
      return r.data.data; 
    } 
  });
  
  const addMutation = useMutation({ 
    mutationFn: goalsAPI.createGoal, 
    onSuccess: () => queryClient.invalidateQueries(['goals']) 
  });
  
  const updateMutation = useMutation({ 
    mutationFn: ({ id, ...data }) => goalsAPI.updateGoal(id, data), 
    onSuccess: () => queryClient.invalidateQueries(['goals']) 
  });
  
  const deleteMutation = useMutation({ 
    mutationFn: goalsAPI.deleteGoal, 
    onSuccess: () => queryClient.invalidateQueries(['goals']) 
  });
  
  return { 
    goals: data?.goals || data || [], 
    isLoading, 
    addGoal: addMutation.mutate, 
    updateGoal: updateMutation.mutate, 
    deleteGoal: deleteMutation.mutate 
  };
}
