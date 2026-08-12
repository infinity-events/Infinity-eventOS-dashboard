const API_URL="https://infinity-eventos-api.onrender.com";


export async function getTicketCategories(festivalId){

const res=await fetch(
`${API_URL}/ticket-category/${festivalId}`
);

if(!res.ok){
throw new Error("Errore caricamento categorie");
}

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


if(!res.ok){

const error=await res.text();

throw new Error(error);

}


return res.json();

}



export async function deleteTicketCategory(id){

const res=await fetch(
`${API_URL}/ticket-category/${id}`,
{
method:"DELETE"
}
);


if(!res.ok){

throw new Error("Errore eliminazione categoria");

}


return true;

}