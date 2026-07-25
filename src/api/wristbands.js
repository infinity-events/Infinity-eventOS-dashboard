import {apiRequest} from "./client";

export function getWristbands(festivalId){
    return apiRequest(`/wristbands/festival/${festivalId}`);
}

export function getWristbandStats(festivalId){
 return apiRequest(`/wristbands/stats/${festivalId}`);
}

export function registerWristband(data){
 return apiRequest("/wristbands/register",{
  method:"POST",
  headers:{
   "Content-Type":"application/json"
  },
  body:JSON.stringify(data)
 });
}