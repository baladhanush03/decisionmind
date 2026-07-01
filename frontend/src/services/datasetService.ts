import api from './api';

export const datasetService = {
  uploadDataset: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getDatasets: async () => {
    const response = await api.get('/datasets/');
    return response.data;
  },
  
  getDatasetEDA: async (id: number) => {
    const response = await api.get(`/datasets/${id}/eda`);
    return response.data;
  }
};
