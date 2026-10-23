import { apiRequest } from "./client";

export function getPosProducts(festivalId) {
  return apiRequest(`/pos/products/${festivalId}`);
}

export function createPosProduct(product) {
  return apiRequest("/pos/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export function updatePosProduct(productId, product) {
  return apiRequest(`/pos/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(product),
  });
}

export function createPosTransaction(transaction) {
  return apiRequest("/pos/transactions", {
    method: "POST",
    body: JSON.stringify(transaction),
  });
}

export function getPosTransactions(festivalId) {
  return apiRequest(`/pos/transactions/${festivalId}`);
}
