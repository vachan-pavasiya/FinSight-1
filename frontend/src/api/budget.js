import client from './client';

export const budgetAPI = {
  getBudgets: () => client.get('/budget'),
  createBudget: (data) => client.post('/budget', data),
  deleteBudget: (id) => client.delete(`/budget/${id}`),
};
