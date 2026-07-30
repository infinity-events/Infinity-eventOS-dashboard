import {apiRequest} from "./client";

export function checkQrEntrance(data){
return apiRequest(
"/entrance/qr",
{
method:"POST",
body:JSON.stringify(data)
}
);
}

export function checkNfcEntrance(data){
return apiRequest(
"/entrance/nfc",
{
method:"POST",
body:JSON.stringify(data)
}
);
}

export function checkManualEntrance(data){
return apiRequest(
"/entrance/manual",
{
method:"POST",
body:JSON.stringify(data)
}
);
}

export function getEntranceLogs(festivalId){
return apiRequest(
`/entrance/logs/${festivalId}`
);
}

export function getEntranceStats(festivalId){
return apiRequest(
`/entrance/stats/${festivalId}`
);
}
