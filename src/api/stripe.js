import { apiRequest } from './client';

export function getStripeStatus(festivalId) {
  return apiRequest(`/festivals/${festivalId}/stripe/status`);
}

export function startStripeConnect(festivalId) {
  return apiRequest(`/festivals/${festivalId}/stripe/connect`, { method: 'POST' });
}
