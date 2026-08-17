import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incomeAPI } from '../api/income';

export function useIncome() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['incomes'],
    queryFn: async () => {
      const r = await incomeAPI.getIncomes();
      return r.data.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: incomeAPI.createIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => incomeAPI.updateIncome(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: incomeAPI.deleteIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return {
    incomes: data?.incomes || [],
    totalMonthlyIncome: data?.totalMonthlyIncome || 0,
    isLoading,
    error,
    addIncome: addMutation.mutate,
    updateIncome: updateMutation.mutate,
    deleteIncome: deleteMutation.mutate,
    isAdding: addMutation.isPending,
  };
}
