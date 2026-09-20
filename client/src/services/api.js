import {
  mockComplaints,
} from '@/data/mockData';
import { delay } from '@/lib/utils';
import {
  api,
  unwrapResponse,
  clearAuthStorage,
  setAuthTokens,
  refreshAccessToken,
} from '@/services/http';

const STORAGE_KEY = 'campusone-session';
function normalizeUser(user) {
  if (!user) return null;
  const id = user.id || user._id;
  return {
    ...user,
    id: id?.toString?.() || id,
    roomNumber: user.roomNumber || user.room || '',
    room: user.room || user.roomNumber || '',
  };
}

function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeUser(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function setSession(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeUser(user)));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function persistAuthResponse(data) {
  setAuthTokens({ token: data.token, refreshToken: data.refreshToken });
  const user = normalizeUser(data.user);
  setSession(user);
  return user;
}

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return persistAuthResponse(response.data);
  },

  async register(data) {
    const response = await api.post('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      hostel: data.hostel,
      room: data.roomNumber || data.room || '',
    });
    return persistAuthResponse(response.data);
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clear local session even if the server call fails.
    } finally {
      clearAuthStorage();
    }
  },

  async getCurrentUser() {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!token && !refreshToken) {
      return null;
    }

    try {
      const response = await api.get('/auth/me');
      const user = normalizeUser(unwrapResponse(response));
      setSession(user);
      return user;
    } catch {
      if (!refreshToken) {
        clearAuthStorage();
        return null;
      }

      try {
        await refreshAccessToken();
        const response = await api.get('/auth/me');
        const user = normalizeUser(unwrapResponse(response));
        setSession(user);
        return user;
      } catch {
        clearAuthStorage();
        return null;
      }
    }
  },

  updateProfile(_userId, data) {
    const updated = normalizeUser({ ...getSession(), ...data, room: data.roomNumber || data.room });
    setSession(updated);
    return updated;
  },

  async forgotPassword(_email) {
    await delay(500);
  },
};

export const complaintService = {
  async getAll(filters = {}) {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.category) params.category = filters.category;
    if (filters.priority) params.priority = filters.priority;
    if (filters.search) params.search = filters.search;
    if (filters.sortBy) params.sortBy = filters.sortBy;

    const response = await api.get('/complaints', { params });
    return unwrapResponse(response);
  },

  async getById(id) {
    const response = await api.get(`/complaints/${id}`);
    return unwrapResponse(response);
  },

  async create(data) {
    const { images = [], studentId, studentName, studentEmail, ...fields } = data;
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });

    images.forEach((image) => {
      if (image?.file instanceof File) {
        formData.append('images', image.file);
      }
    });

    const response = await api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapResponse(response);
  },

  async updateStatus(id, status, note) {
    const response = await api.patch(`/complaints/${id}/status`, { status, note });
    return unwrapResponse(response);
  },

  async updatePriority(id, priority) {
    const response = await api.patch(`/complaints/${id}/priority`, { priority });
    return unwrapResponse(response);
  },

  async updateResolution(id, resolution) {
    const response = await api.patch(`/complaints/${id}/resolution`, { resolution });
    return unwrapResponse(response);
  },

  async getAnalytics() {
    await delay(400);
    const complaints = mockComplaints;
    const byCategory = {};
    const byStatus = {};
    complaints.forEach((c) => {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    });
    const resolved = complaints.filter((c) => c.status === 'Resolved');
    const avgResolutionDays = resolved.length
      ? resolved.reduce((sum, c) => {
          const days = (new Date(c.updatedAt) - new Date(c.createdAt)) / 86400000;
          return sum + days;
        }, 0) / resolved.length
      : 0;
    return {
      total: complaints.length,
      byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
      byStatus: Object.entries(byStatus).map(([name, value]) => ({ name, value })),
      highPriority: complaints.filter((c) => c.priority === 'High' && c.status !== 'Resolved').length,
      unresolved: complaints.filter((c) => c.status !== 'Resolved').length,
      avgResolutionDays: Math.round(avgResolutionDays * 10) / 10,
      trend: [
        { month: 'Mar', count: 12 },
        { month: 'Apr', count: 18 },
        { month: 'May', count: 15 },
        { month: 'Jun', count: 22 },
        { month: 'Jul', count: 19 },
        { month: 'Aug', count: complaints.length },
      ],
    };
  },
};

function buildEventFormData(data = {}) {
  const formData = new FormData();
  const {
    bannerFile,
    imageFile,
    banner,
    image,
    location,
    venue,
    ...fields
  } = data;

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });

  const venueValue = venue || location;
  if (venueValue) formData.append('venue', venueValue);

  const file = imageFile || bannerFile;
  if (file instanceof File) {
    formData.append('image', file);
  } else {
    const imageUrl = image || banner;
    if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
      formData.append('image', imageUrl);
    }
  }

  return formData;
}

export const eventService = {
  async getAll(filters = {}) {
    const params = {};
    if (filters.upcoming) params.upcoming = true;
    if (filters.past) params.past = true;
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;

    const response = await api.get('/events', { params });
    return unwrapResponse(response);
  },

  async getById(id) {
    const response = await api.get(`/events/${id}`);
    return unwrapResponse(response);
  },

  async create(data) {
    const response = await api.post('/events', buildEventFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapResponse(response);
  },

  async update(id, data) {
    const response = await api.patch(`/events/${id}`, buildEventFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapResponse(response);
  },

  async delete(id) {
    await api.delete(`/events/${id}`);
  },

  async register(eventId) {
    const response = await api.post(`/events/${eventId}/register`);
    return unwrapResponse(response);
  },
};
export const messService = {
  async getTodayMenu(date) {
    const params = {};
    if (date) params.date = date;
    const response = await api.get('/mess/menu', { params });
    return unwrapResponse(response);
  },

  async getFeedback(filters = {}) {
    const params = {};
    if (filters.mealType) params.mealType = filters.mealType;
    if (filters.date) params.date = filters.date;
    const response = await api.get('/mess/feedback', { params });
    return unwrapResponse(response);
  },

  async submitFeedback(data) {
    const response = await api.post('/mess/feedback', {
      mealType: data.mealType,
      taste: data.taste,
      hygiene: data.hygiene,
      quantity: data.quantity,
      comment: data.comment || '',
      date: data.date,
    });
    return unwrapResponse(response);
  },

  async getAnalytics() {
    const response = await api.get('/mess/analytics');
    return unwrapResponse(response);
  },

  async upsertMeal(data) {
    const response = await api.post('/mess/meals', data);
    return unwrapResponse(response);
  },
};

export const notificationService = {
  async getForUser(_userId) {
    const response = await api.get('/notifications');
    return unwrapResponse(response);
  },

  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return unwrapResponse(response);
  },

  async markAllAsRead(_userId) {
    const response = await api.patch('/notifications/read-all');
    return unwrapResponse(response);
  },

  async create(data) {
    const response = await api.post('/notifications', data);
    return unwrapResponse(response);
  },
};

export const userService = {
  async getAll(filters = {}) {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.role) params.role = filters.role;
    if (filters.isActive !== undefined && filters.isActive !== null && filters.isActive !== '') {
      params.isActive = filters.isActive;
    }
    const response = await api.get('/users', { params });
    return unwrapResponse(response);
  },

  async getById(id) {
    const response = await api.get(`/users/${id}`);
    return unwrapResponse(response);
  },

  async updateRole(id, role) {
    const response = await api.patch(`/users/${id}/role`, { role });
    return unwrapResponse(response);
  },

  async updateStatus(id, isActive) {
    const response = await api.patch(`/users/${id}/status`, { isActive });
    return unwrapResponse(response);
  },
};

export const dashboardService = {
  async getCampusInfo() {
    const response = await api.get('/dashboard/campus-info');
    return unwrapResponse(response);
  },

  async getRecentActivity() {
    const response = await api.get('/dashboard/activity');
    return unwrapResponse(response);
  },

  async getStudentDashboard() {
    const response = await api.get('/dashboard/student');
    return unwrapResponse(response);
  },

  async getAdminDashboard() {
    const response = await api.get('/dashboard/admin');
    return unwrapResponse(response);
  },

  async getAnalytics() {
    const response = await api.get('/dashboard/analytics');
    return unwrapResponse(response);
  },
};
