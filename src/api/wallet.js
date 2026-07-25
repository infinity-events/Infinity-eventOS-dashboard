import {apiRequest} from "./client";

export function walletStats(festivalId){
return apiRequest(`/wallet/stats/${festivalId}`);
}

export function topupWallet(data){
return apiRequest("/wallet/topup",{
method:"POST",
body:JSON.stringify(data)
});
}

export function payWallet(data){
return apiRequest("/wallet/pay",{
method:"POST",
body:JSON.stringify(data)
});
}