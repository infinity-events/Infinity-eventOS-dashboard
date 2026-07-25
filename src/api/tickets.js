import { apiRequest } from "./client";

export function getTickets(festivalId){
return apiRequest(`/tickets/${festivalId}`);
}

export async function createTicket(data){
console.log("INVIO TICKET API:",data);
    const response = await apiRequest(
    "/tickets",
        {
        method:"POST",
        body:JSON.stringify(data)
        }
    );

console.log("RISPOSTA TICKET API:",response);
return response;
}

export function getTicketStats(festivalId){
return apiRequest(`/tickets/stats/${festivalId}`);
}