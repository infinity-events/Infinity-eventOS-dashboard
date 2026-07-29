const API_URL="https://infinity-eventos-api.onrender.com";


export async function getReportEmail(festivalId){

const response=await fetch(
`${API_URL}/reports/email/${festivalId}`
);

if(!response.ok)
throw new Error("Errore caricamento email");

return response.json();

}


export async function saveReportEmail(festivalId,email){

const response=await fetch(
`${API_URL}/reports/email/${festivalId}`,
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


export async function generateReport(festivalId){

const response=await fetch(
`${API_URL}/reports/generate/${festivalId}`,
{
method:"POST"
}
);

if(!response.ok)
throw new Error("Errore generazione report");

return response.json();

}


export async function sendTestReport(festivalId){

const response=await fetch(
`${API_URL}/reports/email-test/${festivalId}`,
{
method:"POST"
}
);

if(!response.ok)
throw new Error("Errore invio email");

return response.json();

}