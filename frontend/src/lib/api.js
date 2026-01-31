

import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/axios';

export const api = {
  get: (path) => apiGet(path),
  post: (path, body) => apiPost(path, body),
  patch: (path, body) => apiPatch(path, body),
  delete: (path) => apiDelete(path),
};

export default api;
