import { apiRequest } from "./client";

export function getFestivals(){
    return apiRequest("/festivals");
}

export function createFestival(data){
    return apiRequest("/festivals",{
        method:"POST",
        body:JSON.stringify(data)
    });
}