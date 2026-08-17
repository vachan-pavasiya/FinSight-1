import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loansAPI } from '../api/loans';

export function useLoans() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const r = await loansAPI.getLoans();
      return r.data.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: loansAPI.createLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => loansAPI.updateLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const payEmiMutation = useMutation({
    mutationFn: loansAPI.payEmi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: loansAPI.deleteLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return {
    loans: data?.loans || [],
    summary: data?.summary || { totalActiveLoans: 0, totalEmiObligation: 0, totalPrincipalRemaining: 0 },
    isLoading,
    error,
    addLoan: addMutation.mutate,
    updateLoan: updateMutation.mutate,
    payEmi: payEmiMutation.mutate,
    deleteLoan: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isPayingEmi: payEmiMutation.isPending,
  };
}
