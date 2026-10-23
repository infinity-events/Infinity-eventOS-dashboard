import { apiRequest } from "./client";

export function getTicketCategories(festivalId){
  return apiRequest(`/ticket-category/${festivalId}`);
}

export function createTicketCategory(data){
  return apiRequest("/ticket-category",{
    method:"POST",
    body:JSON.stringify(data)
  });
}

export function deleteTicketCategory(id){
  return apiRequest(`/ticket-category/${id}`,{
    method:"DELETE"
  }).then(()=>true);
}
