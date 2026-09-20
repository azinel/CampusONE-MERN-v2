import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

let refreshPromise = null;

export function unwrapResponse(response) {
  const body = response?.data;
  if (body && typeof body.success === 'boolean' && 'data' in body) {
    return body.data;
  }
  return body;
}

export function formatApiError(error) {
  const message = error.response?.data?.message || error.message || 'Request failed';
  return new Error(message);
}

export function clearAuthStorage() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('campusone-session');
}

export function setAuthTokens({ token, refreshToken }) {
  if (token) localStorage.setItem('accessToken', token);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await axios.post(
      `${API_BASE}/api/auth/refresh-token`,
      { refreshToken },
      { withCredentials: true }
    );

    const data = unwrapResponse(response);
    const token = data?.token || data?.accessToken;
    if (!token) {
      throw new Error('Failed to refresh session');
    }

    setAuthTokens({ token, refreshToken: data.refreshToken });
    return token;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthRoute = original?.url?.includes('/auth/login')
      || original?.url?.includes('/auth/register')
      || original?.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        await refreshAccessToken();
        return api(original);
      } catch {
        clearAuthStorage();
      }
    }

    return Promise.reject(formatApiError(error));
  }
);
