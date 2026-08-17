import client from './client';

export const expensesAPI = {
  getExpenses: (params) => client.get('/expenses', { params }),
  createExpense: (data) => client.post('/expenses', data),
  updateExpense: (id, data) => client.put(`/expenses/${id}`, data),
  deleteExpense: (id) => client.delete(`/expenses/${id}`),
  getCategories: () => client.get('/categories'),
};
