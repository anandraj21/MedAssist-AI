import api from './api';

export const aiService = {
  checkSymptoms: (data) => api.post('/ai/symptom-check', data),
  chat: (data) => api.post('/ai/chat', data),
  summarize: (data) => api.post('/ai/summarize', data),
};
