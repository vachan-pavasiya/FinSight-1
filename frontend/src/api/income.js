import client from './client';

export const incomeAPI = {
  getIncomes: () => client.get('/income'),
  createIncome: (data) => client.post('/income', data),
  updateIncome: (id, data) => client.put(`/income/${id}`, data),
  deleteIncome: (id) => client.delete(`/income/${id}`),
};
