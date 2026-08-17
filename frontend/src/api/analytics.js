import client from './client';

export const analyticsAPI = {
  getSummary: () => client.get('/analytics'),
  getTrends: () => client.get('/analytics/trends'),
  getInsights: () => client.get('/analytics/insights'),
  getPredictions: () => client.get('/analytics/predictions'),
  getAnomalies: () => client.get('/analytics/anomalies'),
};
