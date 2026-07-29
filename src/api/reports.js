const API_URL="https://infinity-eventos-api.onrender.com";


export async function generateReport(){

const response=await fetch(
`${API_URL}/reports/generate`,
{
method:"POST"
}
);


if(!response.ok)
throw new Error("Errore generazione report");


return response.json();

}



export async function sendTestReport(){

const response=await fetch(
`${API_URL}/reports/email-test`,
{
method:"POST"
}
);


if(!response.ok)
throw new Error("Errore invio email");


return response.json();

}



export async function saveReportEmail(email){

const response=await fetch(
`${API_URL}/reports/email`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email
})
}
);


if(!response.ok)
throw new Error("Errore salvataggio email");


return response.json();

}



export async function getReportEmail(){

const response=await fetch(
`${API_URL}/reports/email`
);


if(!response.ok)
throw new Error("Errore caricamento email");


return response.json();

}