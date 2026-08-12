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

export function updateFestival(id,data){
return apiRequest(`/festivals/${id}`,{
    method:"PATCH",
    body:JSON.stringify(data)
});
}
