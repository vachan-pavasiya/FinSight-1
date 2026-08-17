import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billsAPI } from '../api/bills';

export function useBills() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const r = await billsAPI.getBills();
      return r.data.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: billsAPI.createBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => billsAPI.updateBill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: billsAPI.deleteBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return {
    bills: data?.bills || [],
    summary: data?.summary || { totalActiveBills: 0, totalMonthlyBills: 0, breakdownByCategory: {} },
    isLoading,
    error,
    addBill: addMutation.mutate,
    updateBill: updateMutation.mutate,
    deleteBill: deleteMutation.mutate,
    isAdding: addMutation.isPending,
  };
}
