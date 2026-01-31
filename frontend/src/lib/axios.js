import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

export function getToken() {
  return typeof localStorage !== 'undefined' ? localStorage.getItem('campusflow_token') : null;
}

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {},
  timeout: 15000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

axiosInstance.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Request failed';
    const status = err.response?.status;
    const e = new Error(message);
    e.status = status;
    e.data = err.response?.data;
    return Promise.reject(e);
  }
);

export const apiGet = (path, config) => axiosInstance.get(path, config);

export const apiPost = (path, body, config) => axiosInstance.post(path, body, config);

export const apiPatch = (path, body, config) => axiosInstance.patch(path, body, config);

export const apiDelete = (path, config) => axiosInstance.delete(path, config);

export default axiosInstance;
