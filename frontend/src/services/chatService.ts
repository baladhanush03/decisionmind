import api from './api';

export const chatService = {
  chatWithDataset: async (datasetId: number, message: string) => {
    const response = await api.post(`/chat/${datasetId}`, {
      message
    });
    return response.data;
  }
};
