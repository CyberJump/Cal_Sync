import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Calendars API
export const calendarsAPI = {
  getAll: () => api.get('/calendars'),
  getById: (id) => api.get(`/calendars/${id}`),
  create: (data) => api.post('/calendars', data),
  update: (id, data) => api.put(`/calendars/${id}`, data),
  delete: (id) => api.delete(`/calendars/${id}`),
};

// Events API
export const eventsAPI = {
  getByDateRange: (startDate, endDate) =>
    api.get('/events', { params: { startDate, endDate } }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  search: (keyword) => api.get('/events/search', { params: { keyword } }),
};

// Participants API
export const participantsAPI = {
  getByEvent: (eventId) => api.get(`/participants/event/${eventId}`),
  add: (data) => api.post('/participants', data),
  updateRsvp: (id, rsvpStatus) => api.put(`/participants/${id}/rsvp`, { rsvpStatus }),
  remove: (id, eventId) => api.delete(`/participants/${id}/event/${eventId}`),
  getShared: () => api.get('/participants/shared'),
  searchUsers: (query) => api.get('/participants/search', { params: { query } }),
};

// Reports & Notifications API
export const reportsAPI = {
  getEventCount: () => api.get('/reports/event-count'),
  getUpcoming: () => api.get('/reports/upcoming'),
  getSummary: () => api.get('/reports/summary'),
  getNotifications: () => api.get('/reports/notifications'),
  getUnreadCount: () => api.get('/reports/notifications/unread-count'),
  markRead: (id) => api.put(`/reports/notifications/${id}/read`),
  markAllRead: () => api.put('/reports/notifications/read-all'),
};
