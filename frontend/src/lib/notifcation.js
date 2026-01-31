import { api } from '@/lib/api';

export async function markNotificationRead(id) {
  return api.patch(`/notifications/${id}`);
}

export async function markAllNotificationsRead() {
  return api.patch(`/notifications/read-all`);
}
