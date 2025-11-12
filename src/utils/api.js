import axios from 'axios';

const BASE_URL = 'https://api-inventory.isavralabel.com/rn-aneka-jaya/api';


const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
export const apiEndpoints = {
  // Products
  getProducts: (page = 1, limit = 10) => api.get(`/products?page=${page}&limit=${limit}`),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProduct: (id, data) => api.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // Categories
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
  
  // Contact
  sendMessage: (data) => api.post('/contact', data),
  
  // Variants
  getProductVariants: (productId) => api.get(`/products/${productId}`),
  createVariant: (data) => api.post('/variants', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateVariant: (id, data) => api.put(`/variants/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteVariant: (id) => api.delete(`/variants/${id}`),
};

export default api;