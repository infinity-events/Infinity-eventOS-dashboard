const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || 'Si è verificato un errore',
    );
  }

  return data;
}

// ============================================================
// PRODUCTS
// ============================================================

export async function getPosProducts(festivalId) {
  const response = await fetch(
    `${API_URL}/pos/products/${festivalId}`,
  );

  return handleResponse(response);
}

export async function createPosProduct(product) {
  const response = await fetch(
    `${API_URL}/pos/products`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    },
  );

  return handleResponse(response);
}

export async function updatePosProduct(
  productId,
  product,
) {
  const response = await fetch(
    `${API_URL}/pos/products/${productId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    },
  );

  return handleResponse(response);
}

// ============================================================
// TRANSACTIONS
// ============================================================

export async function createPosTransaction(
  transaction,
) {
  const response = await fetch(
    `${API_URL}/pos/transactions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    },
  );

  return handleResponse(response);
}

export async function getPosTransactions(
  festivalId,
) {
  const response = await fetch(
    `${API_URL}/pos/transactions/${festivalId}`,
  );

  return handleResponse(response);
}