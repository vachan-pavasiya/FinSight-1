import client from './client';

export const uploadAPI = {
  uploadFile: (formData) => client.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
