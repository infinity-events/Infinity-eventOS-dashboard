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

export async function updateFestival(id,data){
const response=await fetch(
`https://infinity-eventos-api.onrender.com/festivals/${id}`,
{
method:"PATCH",

headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(data)
}
);

if(!response.ok){

throw new Error(
"Errore aggiornamento festival"
);
}
return response.json();
}