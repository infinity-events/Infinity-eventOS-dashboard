import {API_URL} from "./config";


export async function getTicketCategories(festivalId){

const res=await fetch(
`${API_URL}/ticket-category/${festivalId}`
);

return res.json();

}


export async function createTicketCategory(data){

const res=await fetch(
`${API_URL}/ticket-category`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(data)
}
);

return res.json();

}


export async function deleteTicketCategory(id){

return fetch(
`${API_URL}/ticket-category/${id}`,
{
method:"DELETE"
}
);

}