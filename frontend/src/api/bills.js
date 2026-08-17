import client from './client';

export const billsAPI = {
  getBills: () => client.get('/bills'),
  createBill: (data) => client.post('/bills', data),
  updateBill: (id, data) => client.put(`/bills/${id}`, data),
  deleteBill: (id) => client.delete(`/bills/${id}`),
};
