import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Documents API calls
export const documentsAPI = {
  getAll: () => api.get('/documents'),
  getById: (id: string) => api.get(`/documents/${id}`),
  upload: (formData: FormData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id: string) => api.delete(`/documents/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/documents/${id}/status`, { status }),
  addSignature: (id: string, signatureData: any) =>
    api.post(`/documents/${id}/signatures`, signatureData),
  generatePublicLink: (id: string) => api.post(`/documents/${id}/public-link`),
};

// Signatures API calls
export const signaturesAPI = {
  create: (documentId: string, signatureData: any) =>
    api.post(`/signatures`, { documentId, ...signatureData }),
  getByDocument: (documentId: string) => api.get(`/signatures/document/${documentId}`),
  update: (id: string, updates: any) => api.patch(`/signatures/${id}`, updates),
  delete: (id: string) => api.delete(`/signatures/${id}`),
};

// Public signing API calls (no auth required)
export const publicAPI = {
  getDocument: (token: string) => 
    axios.get(`${process.env.REACT_APP_API_URL}/public/documents/${token}`),
  submitSignature: (token: string, signatureData: any) =>
    axios.post(`${process.env.REACT_APP_API_URL}/public/documents/${token}/sign`, signatureData),
};

// Audit trail API calls
export const auditAPI = {
  getByDocument: (documentId: string) => api.get(`/audit/${documentId}`),
  getAll: () => api.get('/audit'),
};

export default api;