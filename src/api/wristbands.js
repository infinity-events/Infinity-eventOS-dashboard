import {apiRequest} from "./client";


export function registerWristband(data){

return apiRequest(
"/wristbands/register",
{
method:"POST",
body:JSON.stringify(data)
}
);

}


export function getWristbands(festivalId){

return apiRequest(
`/wristbands/festival/${festivalId}`
);

}


export function getWristbandStats(festivalId){

return apiRequest(
`/wristbands/stats/${festivalId}`
);

}