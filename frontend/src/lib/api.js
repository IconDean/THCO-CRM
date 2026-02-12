import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Configure axios defaults
const apiClient = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  
  login: async (data) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },
  
  exchangeSession: async (sessionId) => {
    const response = await apiClient.post('/auth/session', {}, {
      headers: { 'X-Session-ID': sessionId }
    });
    return response.data;
  },
  
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
  
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', { token, new_password: newPassword });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },
  
  create: async (data) => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },
  
  update: async (userId, data) => {
    const response = await apiClient.put(`/users/${userId}`, data);
    return response.data;
  },
  
  delete: async (userId) => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },
  
  lockDevice: async (userId) => {
    const response = await apiClient.post(`/users/${userId}/lock-device`);
    return response.data;
  },
  
  unlockDevice: async (userId) => {
    const response = await apiClient.post(`/users/${userId}/unlock-device`);
    return response.data;
  },
  
  updateDevice: async (userId) => {
    const response = await apiClient.post(`/users/${userId}/update-device`);
    return response.data;
  },
};

// Sourcing Requests API
export const sourcingAPI = {
  create: async (data) => {
    const response = await apiClient.post('/sourcing-requests', data);
    return response.data;
  },
  
  getAll: async () => {
    const response = await apiClient.get('/sourcing-requests');
    return response.data;
  },
};

// Database Search API
export const databaseSearchAPI = {
  create: async (data) => {
    const response = await apiClient.post('/database-searches', data);
    return response.data;
  },
  
  getAll: async () => {
    const response = await apiClient.get('/database-searches');
    return response.data;
  },
};

// Settings API
export const settingsAPI = {
  getWebhooks: async () => {
    const response = await apiClient.get('/settings/webhooks');
    return response.data;
  },
  
  updateWebhooks: async (data) => {
    const response = await apiClient.put('/settings/webhooks', data);
    return response.data;
  },
  
  testWebhook: async (webhookType, url) => {
    const response = await apiClient.post(`/settings/webhooks/test?webhook_type=${webhookType}&url=${encodeURIComponent(url)}`);
    return response.data;
  },
};

// Activity Logs API
export const activityAPI = {
  getLogs: async (params = {}) => {
    const response = await apiClient.get('/activity-logs', { params });
    return response.data;
  },
  
  getCount: async () => {
    const response = await apiClient.get('/activity-logs/count');
    return response.data;
  },
};

// Login Records API
export const loginRecordsAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/login-records', { params });
    return response.data;
  },
  
  getCount: async () => {
    const response = await apiClient.get('/login-records/count');
    return response.data;
  },
  
  getByUser: async (userId, limit = 20) => {
    const response = await apiClient.get(`/login-records/user/${userId}?limit=${limit}`);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },
};

// Clients API
export const clientsAPI = {
  getAll: async () => {
    const response = await apiClient.get('/clients');
    return response.data;
  },
  
  create: async (data) => {
    const response = await apiClient.post('/clients', data);
    return response.data;
  },
  
  update: async (clientId, data) => {
    const response = await apiClient.put(`/clients/${clientId}`, data);
    return response.data;
  },
  
  delete: async (clientId) => {
    const response = await apiClient.delete(`/clients/${clientId}`);
    return response.data;
  },
  
  getProposals: async (clientId) => {
    const response = await apiClient.get(`/clients/${clientId}/proposals`);
    return response.data;
  },
  
  uploadProposal: async (clientId, file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/clients/${clientId}/proposals`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },
};

// Proposals API
export const proposalsAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/proposals', { params });
    return response.data;
  },
  
  delete: async (proposalId) => {
    const response = await apiClient.delete(`/proposals/${proposalId}`);
    return response.data;
  },
  
  regenerateLink: async (proposalId) => {
    const response = await apiClient.post(`/proposals/${proposalId}/regenerate-link`);
    return response.data;
  },
  
  getShared: async (shareToken) => {
    const response = await apiClient.get(`/proposals/shared/${shareToken}`);
    return response.data;
  },
  
  getDownloadUrl: (shareToken) => {
    return `${API}/proposals/shared/${shareToken}/download`;
  },
};

export default apiClient;
