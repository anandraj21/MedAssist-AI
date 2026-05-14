import axios from 'axios';

let backendUrl = import.meta.env.VITE_API_URL || '';
if (backendUrl.endsWith('/')) {
  backendUrl = backendUrl.slice(0, -1);
}

const BASE_URL = backendUrl ? `${backendUrl}/api` : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('medassist_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { backendUrl };
export default api;
