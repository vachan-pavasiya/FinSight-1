import client from './client';

export const reportsAPI = {
  generateReport: (startDate, endDate) => client.get('/report', { params: { startDate, endDate }, responseType: 'blob' }),
  listReports: () => client.get('/report/list'),
};
