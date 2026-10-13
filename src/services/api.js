import axios from 'axios';

const rawBase = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = rawBase ? (rawBase.endsWith('/') ? rawBase.slice(0, -1) + '/api' : rawBase + '/api') : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('planora_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        // optionally clear stale token
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

export const eventApi = {
  getAll: (status) => api.get('/events', { params: { status } }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

export const vendorApi = {
  getAll: (params) => api.get('/vendors', { params }),
  getById: (id) => api.get(`/vendors/${id}`),
  compare: (ids) => api.post('/vendors/compare', ids),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
  getMyListings: () => api.get('/vendors/my-listings'),
};

export const budgetApi = {
  getItems: (eventId) => api.get(`/budget/event/${eventId}`),
  getSummary: (eventId) => api.get(`/budget/event/${eventId}/summary`),
  create: (data) => api.post('/budget', data),
  update: (id, data) => api.put(`/budget/${id}`, data),
  delete: (id) => api.delete(`/budget/${id}`),
};

export const checklistApi = {
  getTasks: (eventId) => api.get(`/checklists/event/${eventId}`),
  create: (data) => api.post('/checklists', data),
  update: (id, data) => api.put(`/checklists/${id}`, data),
  toggle: (id) => api.patch(`/checklists/${id}/toggle`),
  delete: (id) => api.delete(`/checklists/${id}`),
};

export const bookingApi = {
  create: (data) => api.post('/bookings', data),
  getMyRequests: () => api.get('/bookings/my-requests'),
  getVendorBookings: (vendorId) => api.get(`/bookings/vendor/${vendorId}`),
  updateStatus: (id, status, responseNote) => api.patch(`/bookings/${id}/status`, { status, responseNote }),
};

export const favoriteApi = {
  getAll: () => api.get('/favorites'),
  toggle: (vendorId) => api.post(`/favorites/${vendorId}/toggle`),
};

export const reviewApi = {
  getByVendor: (vendorId) => api.get(`/reviews/vendor/${vendorId}`),
  create: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const aiApi = {
  getRecommendations: (data) => api.post('/recommendations', data),
  getRecommendationsForEvent: (eventId, category) => api.get(`/recommendations/event/${eventId}`, { params: { category } }),
  chat: (data) => api.post('/ai/chat', data),
};

export const dashboardApi = {
  getDashboard: () => api.get('/dashboard'),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  updateRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  getBookings: () => api.get('/admin/bookings'),
  getReviews: () => api.get('/admin/reviews'),
  deleteReview: (reviewId) => api.delete(`/admin/reviews/${reviewId}`),
};

export default api;
