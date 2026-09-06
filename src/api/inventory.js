import { apiRequest } from "./client";

// ============================================================
// STATS
// ============================================================

export function getInventoryStats() {
  return apiRequest("/inventory/stats");
}

// ============================================================
// ASSETS
// ============================================================

export function getInventoryAssets() {
  return apiRequest("/inventory/assets");
}

export function getInventoryAsset(assetCode) {
  return apiRequest(
    `/inventory/assets/${encodeURIComponent(assetCode)}`
  );
}

export function createInventoryAsset(data) {
  return apiRequest("/inventory/assets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================================
// RENTALS
// ============================================================

export function getInventoryRentals() {
  return apiRequest("/inventory/rentals");
}

export function getInventoryRental(id) {
  return apiRequest(
    `/inventory/rentals/${encodeURIComponent(id)}`
  );
}

export function createInventoryRental(data) {
  return apiRequest("/inventory/rentals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================================
// RETURN
// ============================================================

export function returnInventoryAsset(assetCode) {
  return apiRequest(
    `/inventory/assets/${encodeURIComponent(assetCode)}/return`,
    {
      method: "POST",
    }
  );
}

// ============================================================
// HISTORY
// ============================================================

export function getInventoryMovements() {
  return apiRequest("/inventory/movements");
}