import { apiRequest } from "./client";

export function getReportEmail(festivalId){
  return apiRequest(`/reports/email/${festivalId}`);
}

export function saveReportEmail(festivalId,email){
  return apiRequest(`/reports/email/${festivalId}`,{
    method:"POST",
    body:JSON.stringify({email})
  });
}

export function generateReport(festivalId){
  return apiRequest(`/reports/generate/${festivalId}`,{
    method:"POST"
  });
}

export function sendTestReport(festivalId){
  return apiRequest(`/reports/email-test/${festivalId}`,{
    method:"POST"
  });
}
