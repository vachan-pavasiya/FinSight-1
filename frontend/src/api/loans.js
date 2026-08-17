import client from './client';

export const loansAPI = {
  getLoans: () => client.get('/loans'),
  createLoan: (data) => client.post('/loans', data),
  updateLoan: (id, data) => client.put(`/loans/${id}`, data),
  payEmi: (id) => client.post(`/loans/${id}/pay-emi`),
  deleteLoan: (id) => client.delete(`/loans/${id}`),
};
