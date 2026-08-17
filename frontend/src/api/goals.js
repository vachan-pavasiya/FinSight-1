import client from './client';

export const goalsAPI = {
  getGoals: () => client.get('/goals'),
  createGoal: (data) => client.post('/goals', data),
  updateGoal: (id, data) => client.put(`/goals/${id}`, data),
  deleteGoal: (id) => client.delete(`/goals/${id}`),
};
