import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../api/analytics';
import { expensesAPI } from '../api/expenses';

export function useAnalytics() {
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const res = await analyticsAPI.getSummary();
      return res.data.data;
    },
  });

  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['analytics-trends'],
    queryFn: async () => {
      const res = await analyticsAPI.getTrends();
      return res.data.data;
    },
  });

  const { data: insightsData, isLoading: insightsLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const res = await analyticsAPI.getInsights();
      return res.data.data;
    },
  });

  const { data: predictionsData, isLoading: predictionsLoading } = useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      const res = await analyticsAPI.getPredictions();
      return res.data.data;
    },
  });

  const { data: anomaliesData, isLoading: anomaliesLoading } = useQuery({
    queryKey: ['anomalies'],
    queryFn: async () => {
      const res = await analyticsAPI.getAnomalies();
      return res.data.data;
    },
  });

  return {
    summary: summaryData,
    trends: trendsData,
    insights: insightsData?.insights || [],
    predictions: predictionsData,
    anomalies: anomaliesData?.anomalies || [],
    isLoading: summaryLoading || trendsLoading || insightsLoading || predictionsLoading || anomaliesLoading,
    summaryLoading,
    trendsLoading,
    insightsLoading,
    predictionsLoading,
    anomaliesLoading,
  };
}
