import api from './api';

export const automlService = {
  getDatasetColumns: async (datasetId: number) => {
    const response = await api.get(`/models/datasets/${datasetId}/columns`);
    return response.data;
  },
  
  trainModel: async (datasetId: number, targetColumn: string) => {
    const response = await api.post('/models/train', {
      dataset_id: datasetId,
      target_column: targetColumn,
    });
    return response.data;
  },
  
  getModels: async () => {
    const response = await api.get('/models/');
    return response.data;
  },
  
  predict: async (modelId: number, payload: any) => {
    const response = await api.post(`/models/${modelId}/predict`, payload);
    return response.data;
  }
};
