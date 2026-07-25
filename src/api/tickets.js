import { apiRequest } from "./client";

export function getTickets(festivalId){
return apiRequest(`/tickets/${festivalId}`);
}

export function createTicket(data){
    return apiRequest("/tickets",{
        method:"POST",
        body:JSON.stringify(data)
    });
}

export function getTicketStats(festivalId){
return apiRequest(`/tickets/stats/${festivalId}`);
}