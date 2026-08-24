import { useEffect, useMemo, useState } from 'react';

import {
  CreditCard,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Package,
  X,
  Pencil,
  Power,
  PlusCircle,
} from 'lucide-react';

import {
  createPosProduct,
  createPosTransaction,
  getPosProducts,
  updatePosProduct,
} from '../api/pos';

import { useFestival } from '../contexts/FestivalContext';

import './POS.css';

export default function POS() {
  const { selectedFestival } =
    useFestival();

  const [products, setProducts] =
    useState([]);

  const [cart, setCart] =
    useState([]);

  const [category, setCategory] =
    useState('Tutti');

  const [loading, setLoading] =
    useState(true);

  const [paying, setPaying] =
    useState(false);

  const [showProductManager, setShowProductManager] =
  useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [savingProduct, setSavingProduct] =
  useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    imageUrl: '',
  });

  // ==========================================================
  // LOAD PRODUCTS
  // ==========================================================

  async function loadProducts() {
    if (!selectedFestival?.id) {
      return;
    }

    try {
      setLoading(true);

      const data =
        await getPosProducts(
          selectedFestival.id,
        );

      setProducts(data);
    } catch (error) {
      console.error(
        'Errore caricamento prodotti:',
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [selectedFestival?.id]);

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const categories = useMemo(() => {
    const uniqueCategories =
      new Set(
        products
          .map(
            (product) =>
              product.category,
          )
          .filter(Boolean),
      );

    return [
      'Tutti',
      ...uniqueCategories,
    ];
  }, [products]);

  const activeProducts = useMemo(() => {
  return products.filter(
    (product) =>
      product.status !== 'INACTIVE',
  );
}, [products]);

const filteredProducts = useMemo(() => {
  if (category === 'Tutti') {
    return activeProducts;
  }

  return activeProducts.filter(
    (product) =>
      product.category === category,
  );
}, [activeProducts, category]);

  // ==========================================================
  // TOTAL
  // ==========================================================

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        item.price *
          item.quantity,

      0,
    );
  }, [cart]);

  const cartQuantity = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum + item.quantity,

      0,
    );
  }, [cart]);

  // ==========================================================
  // ADD
  // ==========================================================

  function addToCart(product) {
    if (product.stock <= 0) {
      return;
    }

    setCart((current) => {
      const existing =
        current.find(
          (item) =>
            item.id ===
            product.id,
        );

      if (existing) {
        if (
          existing.quantity >=
          product.stock
        ) {
          return current;
        }

        return current.map(
          (item) =>
            item.id ===
            product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity +
                    1,
                }
              : item,
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  // ==========================================================
  // DECREASE
  // ==========================================================

  function decrease(
    productId,
  ) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId
            ? {
                ...item,

                quantity:
                  item.quantity -
                  1,
              }
            : item,
        )
        .filter(
          (item) =>
            item.quantity > 0,
        ),
    );
  }

  // ==========================================================
  // INCREASE
  // ==========================================================

  function increase(
    productId,
  ) {
    setCart((current) =>
      current.map((item) => {
        if (
          item.id !==
          productId
        ) {
          return item;
        }

        if (
          item.quantity >=
          item.stock
        ) {
          return item;
        }

        return {
          ...item,

          quantity:
            item.quantity + 1,
        };
      }),
    );
  }

  // ==========================================================
  // REMOVE
  // ==========================================================

  function remove(productId) {
    setCart((current) =>
      current.filter(
        (item) =>
          item.id !==
          productId,
      ),
    );
  }

  // ==========================================================
  // NEW PRODUCT
  // ==========================================================

  function openNewProduct() {
  setEditingProduct(null);

  setProductForm({
    name: '',
    description: '',
    imageUrl: '',
    category: '',
    price: '',
    stock: '',
  });

  setShowProductForm(true);
}

function openEditProduct(product) {
  setEditingProduct(product);

  setProductForm({
    name: product.name || '',
    description: product.description || '',
    imageUrl: product.imageUrl || '',
    category: product.category || '',
    price: product.price ?? '',
    stock: product.stock ?? '',
  });

  setShowProductForm(true);
}

function closeProductForm() {
  if (savingProduct) return;

  setShowProductForm(false);
  setEditingProduct(null);
}

function handleProductChange(event) {
  const { name, value } = event.target;

  setProductForm((current) => ({
    ...current,
    [name]: value,
  }));
}

async function saveProduct(event) {
  event.preventDefault();

  if (!selectedFestival?.id) {
    alert('Seleziona prima un festival.');
    return;
  }

  if (!productForm.name.trim()) {
    alert('Inserisci il nome del prodotto.');
    return;
  }

  const price = Number(productForm.price);
  const stock = Number(productForm.stock);

  if (!Number.isFinite(price) || price < 0) {
    alert('Inserisci un prezzo valido.');
    return;
  }

  if (!Number.isInteger(stock) || stock < 0) {
    alert('Inserisci una quantità valida.');
    return;
  }

  try {
    setSavingProduct(true);

    const payload = {
      festivalId: selectedFestival.id,
      name: productForm.name.trim(),
      description:
        productForm.description.trim() || undefined,
      imageUrl:
        productForm.imageUrl.trim() || undefined,
      category:
        productForm.category.trim() || undefined,
      price,
      stock,
    };

    if (editingProduct) {
      await updatePosProduct(
        editingProduct.id,
        payload,
      );
    } else {
      await createPosProduct(payload);
    }

    await loadProducts();

    setShowProductForm(false);
    setEditingProduct(null);

    setProductForm({
      name: '',
      description: '',
      imageUrl: '',
      category: '',
      price: '',
      stock: '',
    });
  } catch (error) {
    console.error(
      'Errore salvataggio prodotto:',
      error,
    );

    alert(
      error.message ||
        'Impossibile salvare il prodotto.',
    );
  } finally {
    setSavingProduct(false);
  }
}

  // ==========================================================
  // PAYMENT
  // ==========================================================

  async function pay() {
    if (
      !cart.length ||
      paying ||
      !selectedFestival?.id
    ) {
      return;
    }

    try {
      setPaying(true);

      await createPosTransaction({
        festivalId:
          selectedFestival.id,

        paymentMethod:
          'CASH',

        items: cart.map(
          (item) => ({
            productId:
              item.id,

            quantity:
              item.quantity,
          }),
        ),
      });

      // Svuotiamo il carrello
      setCart([]);

      // Aggiorniamo immediatamente
      // le quantità visualizzate
      await loadProducts();
    } catch (error) {
      console.error(
        'Errore pagamento:',
        error,
      );

      alert(
        error.message ||
          'Pagamento non riuscito',
      );
    } finally {
      setPaying(false);
    }
  }

  // ==========================================================
// PRODUCT MANAGER
// ==========================================================

function openCreateProduct() {
  setEditingProduct(null);

  setProductForm({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    imageUrl: '',
  });

  setShowProductManager(true);
}

function openEditProduct(product) {
  setEditingProduct(product);

  setProductForm({
    name: product.name || '',
    description: product.description || '',
    category: product.category || '',
    price: product.price ?? '',
    stock: product.stock ?? '',
    imageUrl: product.imageUrl || '',
  });

  setShowProductManager(true);
}

function closeProductForm() {
  setEditingProduct(null);

  setProductForm({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    imageUrl: '',
  });
}

async function saveProduct(event) {
  event.preventDefault();

  if (!selectedFestival?.id) {
    return;
  }

  if (!productForm.name.trim()) {
    alert('Inserisci il nome del prodotto.');
    return;
  }

  if (
    productForm.price === '' ||
    Number(productForm.price) < 0
  ) {
    alert('Inserisci un prezzo valido.');
    return;
  }

  if (
    productForm.stock === '' ||
    Number(productForm.stock) < 0
  ) {
    alert('Inserisci una quantità valida.');
    return;
  }

  try {
    setSavingProduct(true);

    const payload = {
      festivalId: selectedFestival.id,
      name: productForm.name.trim(),
      description:
        productForm.description.trim() || null,
      category:
        productForm.category.trim() || null,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      imageUrl:
        productForm.imageUrl.trim() || null,
    };

    if (editingProduct) {
      await updatePosProduct(
        editingProduct.id,
        payload,
      );
    } else {
      await createPosProduct(payload);
    }

    await loadProducts();

    closeProductForm();
  } catch (error) {
    console.error(
      'Errore salvataggio prodotto:',
      error,
    );

    alert(
      error.message ||
        'Impossibile salvare il prodotto.',
    );
  } finally {
    setSavingProduct(false);
  }
}

async function toggleProduct(product) {
  const newStatus =
    product.status === 'ACTIVE'
      ? 'INACTIVE'
      : 'ACTIVE';

  try {
    await updatePosProduct(
      product.id,
      {
        status: newStatus,
      },
    );

    await loadProducts();
  } catch (error) {
    console.error(
      'Errore modifica stato prodotto:',
      error,
    );

    alert(
      error.message ||
        'Impossibile modificare lo stato del prodotto.',
    );
  }
}

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="pos-page">

      {/* ====================================================
          PRODUCTS
          ==================================================== */}

      <main className="pos-main">

        <header className="pos-header">
          <div>
            <h1>POS</h1>
            <p>
              Gestione vendite
            </p>
          </div>

          <div className="pos-header-actions">

            <button
              className="manage-products-button"
              onClick={() =>
                setShowProductManager(true)
              }
            >
              <Settings size={17} />

              Gestisci prodotti
            </button>

          </div>

        </header>

        <section className="products-grid">

          {loading ? (
            <div className="pos-loading">
              Caricamento prodotti...
            </div>
          ) : filteredProducts.length ===
            0 ? (
            <div className="pos-empty">
              <ShoppingCart
                size={40}
              />

              <h3>
                Nessun prodotto
              </h3>

              <p>
                Aggiungi dei prodotti
                dal magazzino.
              </p>
            </div>
          ) : (
            filteredProducts.map(
              (product) => (
                <button
                  key={
                    product.id
                  }
                  className={`product-card ${
                    product.stock <=
                    0
                      ? 'sold-out'
                      : ''
                  }`}
                  disabled={
                    product.stock <=
                    0
                  }
                  onClick={() =>
                    addToCart(
                      product,
                    )
                  }
                >

                  <div className="product-image">

                    {product.imageUrl ? (
                      <img
                        src={
                          product.imageUrl
                        }
                        alt={
                          product.name
                        }
                      />
                    ) : (
                      <ShoppingCart
                        size={34}
                      />
                    )}

                  </div>

                  <div className="product-info">

                    <strong>
                      {
                        product.name
                      }
                    </strong>

                    <span>
                      €
                      {' '}
                      {product.price.toFixed(
                        2,
                      )}
                    </span>

                    <small>
                      {product.stock >
                      0
                        ? `${product.stock} disponibili`
                        : 'Esaurito'}
                    </small>

                  </div>

                </button>
              ),
            )
          )}

        </section>

      </main>

      {/* ====================================================
          CART
          ==================================================== */}

      <aside className="pos-cart">

        <header className="cart-header">

          <div>
            <h2>
              Carrello
            </h2>

            <span>
              {cartQuantity}{' '}
              {cartQuantity ===
              1
                ? 'prodotto'
                : 'prodotti'}
            </span>
          </div>

          {cart.length >
            0 && (
            <button
              onClick={() =>
                setCart([])
              }
            >
              Svuota
            </button>
          )}

        </header>

        <div className="cart-items">

          {cart.length === 0 ? (
            <div className="empty-cart">

              <ShoppingCart
                size={44}
              />

              <p>
                Il carrello è vuoto
              </p>

              <span>
                Tocca un prodotto
                per aggiungerlo
              </span>

            </div>
          ) : (
            cart.map((item) => (
              <div
                className="cart-item"
                key={item.id}
              >

                <div className="cart-item-info">

                  <strong>
                    {item.name}
                  </strong>

                  <span>
                    €
                    {' '}
                    {(
                      item.price *
                      item.quantity
                    ).toFixed(2)}
                  </span>

                </div>

                <div className="quantity">

                  <button
                    onClick={() =>
                      decrease(
                        item.id,
                      )
                    }
                  >
                    <Minus
                      size={16}
                    />
                  </button>

                  <span>
                    {
                      item.quantity
                    }
                  </span>

                  <button
                    onClick={() =>
                      increase(
                        item.id,
                      )
                    }
                  >
                    <Plus
                      size={16}
                    />
                  </button>

                  <button
                    className="delete"
                    onClick={() =>
                      remove(
                        item.id,
                      )
                    }
                  >
                    <Trash2
                      size={16}
                    />
                  </button>

                </div>

              </div>
            ))
          )}

        </div>

        <footer className="cart-footer">

          <div className="total">

            <span>
              Totale
            </span>

            <strong>
              €
              {' '}
              {total.toFixed(
                2,
              )}
            </strong>

          </div>

          <button
            className="pay-button"
            disabled={
              cart.length ===
                0 ||
              paying
            }
            onClick={pay}
          >

            <CreditCard
              size={22}
            />

            {paying
              ? 'Pagamento...'
              : `PAGA € ${total.toFixed(
                  2,
                )}`}

          </button>

        </footer>

      </aside>

{showProductManager && (
  <div
    className="product-manager-overlay"
    onMouseDown={(event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        setShowProductManager(false);
      }
    }}
  >

    <div className="product-manager">

      {/* HEADER */}

      <header className="product-manager-header">

        <div>
          <h2>
            Gestisci prodotti
          </h2>

          <p>
            Gestisci prodotti,
            prezzi e disponibilità
          </p>
        </div>

        <button
          className="close-manager"
          onClick={() =>
            setShowProductManager(false)
          }
        >
          <X size={20} />
        </button>

      </header>

      {/* CONTENT */}

      <div className="product-manager-content">

        {showProductForm ? (

          <form
            className="product-form"
            onSubmit={saveProduct}
          >

            <div className="product-form-header">

              <div>
                <h3>
                  {editingProduct
                    ? 'Modifica prodotto'
                    : 'Nuovo prodotto'}
                </h3>

                <p>
                  Inserisci i dati del prodotto
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeProductForm
                }
              >
                Annulla
              </button>

            </div>

            <div className="product-form-grid">

              <label>
                Nome prodotto

                <input
                  name="name"
                  value={
                    productForm.name
                  }
                  onChange={
                    handleProductChange
                  }
                  placeholder="Es. Birra"
                  required
                />
              </label>

              <label>
                Categoria

                <input
                  name="category"
                  value={
                    productForm.category
                  }
                  onChange={
                    handleProductChange
                  }
                  placeholder="Es. Drink"
                />
              </label>

              <label>
                Prezzo (€)

                <input
                  type="number"
                  name="price"
                  value={
                    productForm.price
                  }
                  onChange={
                    handleProductChange
                  }
                  placeholder="5.00"
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Quantità iniziale

                <input
                  type="number"
                  name="stock"
                  value={
                    productForm.stock
                  }
                  onChange={
                    handleProductChange
                  }
                  placeholder="100"
                  min="0"
                  step="1"
                  required
                />
              </label>

              <label className="full">
                Descrizione

                <textarea
                  name="description"
                  value={
                    productForm.description
                  }
                  onChange={
                    handleProductChange
                  }
                  placeholder="Descrizione opzionale..."
                  rows="3"
                />
              </label>

              <label className="full">
                URL immagine

                <input
                  name="imageUrl"
                  value={
                    productForm.imageUrl
                  }
                  onChange={
                    handleProductChange
                  }
                  placeholder="https://..."
                />
              </label>

            </div>

            {productForm.imageUrl && (
              <div className="product-preview">

                <span>
                  Anteprima immagine
                </span>

                <img
                  src={
                    productForm.imageUrl
                  }
                  alt="Anteprima"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      'none';
                  }}
                />

              </div>
            )}

            <button
              type="submit"
              className="save-product-button"
              disabled={savingProduct}
            >
              {savingProduct
                ? 'Salvataggio...'
                : editingProduct
                  ? 'Salva modifiche'
                  : 'Aggiungi prodotto'}
            </button>

          </form>

        ) : (

          <>

            <div className="manager-toolbar">

              <strong>
                {products.length}{' '}
                {products.length === 1
                  ? 'prodotto'
                  : 'prodotti'}
              </strong>

              <button
                className="new-product-button"
                onClick={
                  openNewProduct
                }
              >
                <PlusCircle
                  size={17}
                />

                Nuovo prodotto
              </button>

            </div>

            {products.length === 0 ? (

              <div className="manager-empty">

                <ShoppingCart
                  size={40}
                />

                <h3>
                  Nessun prodotto
                </h3>

                <p>
                  Aggiungi il primo prodotto
                  del festival.
                </p>

              </div>

            ) : (

              <div className="manager-products-list">

                {products.map(
                  (product) => (
                    <div
                      className={`manager-product ${
                        product.status ===
                        'INACTIVE'
                          ? 'inactive'
                          : ''
                      }`}
                      key={product.id}
                    >

                      <div className="manager-product-image">

                        {product.imageUrl ? (
                          <img
                            src={
                              product.imageUrl
                            }
                            alt={
                              product.name
                            }
                          />
                        ) : (
                          <ShoppingCart
                            size={24}
                          />
                        )}

                      </div>

                      <div className="manager-product-info">

                        <strong>
                          {
                            product.name
                          }
                        </strong>

                        <span>
                          €
                          {' '}
                          {Number(
                            product.price,
                          ).toFixed(2)}
                        </span>

                        <small>
                          Stock:{' '}
                          {
                            product.stock
                          }
                        </small>

                      </div>

                      <div className="manager-product-actions">

                        <button
                          onClick={() =>
                            openEditProduct(
                              product,
                            )
                          }
                        >
                          <Pencil
                            size={14}
                          />

                          Modifica
                        </button>

                      </div>

                    </div>
                  ),
                )}

              </div>

            )}

          </>

        )}

      </div>

    </div>

  </div>
)}

    </div>
  );
}