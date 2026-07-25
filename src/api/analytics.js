const API_URL="https://infinity-eventos-api.onrender.com";


export async function getAnalytics(festivalId){

const response=await fetch(
`${API_URL}/analytics/${festivalId}`
);


if(!response.ok){

throw new Error(
"Errore caricamento analytics"
);

}


return response.json();

}