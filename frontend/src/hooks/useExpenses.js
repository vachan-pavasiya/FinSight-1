import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesAPI } from '../api/expenses';
import { useState } from 'react';

export function useExpenses(initialFilters = {}) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ page: 1, limit: 20, ...initialFilters });
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['expenses', filters],
    queryFn: async () => { 
      const r = await expensesAPI.getExpenses(filters); 
      return r.data.data; 
    }
  });
  
  const addMutation = useMutation({ 
    mutationFn: expensesAPI.createExpense, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => expensesAPI.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
  
  const deleteMutation = useMutation({ 
    mutationFn: expensesAPI.deleteExpense, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });
  
  return { 
    expenses: data?.expenses || [], 
    total: data?.total || 0, 
    page: data?.page || 1, 
    pages: data?.pages || 1, 
    isLoading, 
    error, 
    filters, 
    setFilters, 
    addExpense: addMutation.mutate,
    updateExpense: updateMutation.mutate,
    deleteExpense: deleteMutation.mutate, 
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
