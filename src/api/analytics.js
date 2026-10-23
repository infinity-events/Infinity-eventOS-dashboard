import { apiRequest } from "./client";

export function getAnalytics(festivalId){
  return apiRequest(`/analytics/${festivalId}`);
}
