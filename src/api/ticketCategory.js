const API_URL="https://infinity-eventos-api.onrender.com";

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