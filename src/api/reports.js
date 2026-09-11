const API_URL="https://infinity-eventos-api.onrender.com";

async function readError(response, fallback) {
  try {
    const payload = await response.json();
    if (payload?.message) {
      return Array.isArray(payload.message)
        ? payload.message.join(", ")
        : payload.message;
    }
  } catch {
    // Keep the stable fallback for empty/non-JSON responses.
  }

  return fallback;
}


export async function getReportEmail(festivalId){

const response=await fetch(
`${API_URL}/reports/email/${festivalId}`
);

if(!response.ok)
throw new Error(await readError(response, "Errore caricamento email"));

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
throw new Error(await readError(response, "Errore salvataggio email"));

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
throw new Error(await readError(response, "Errore generazione report"));

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
throw new Error(await readError(response, "Errore invio email"));

return response.json();

}
