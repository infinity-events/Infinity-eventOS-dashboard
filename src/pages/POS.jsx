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

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    imageUrl: '',
  });

  const [savingProduct, setSavingProduct] =
    useState(false);

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
            onClick={() => {
              setShowProductManager(true);
              setEditingProduct(null);
            }}
          >
            <Package size={18} />
            Gestisci prodotti
          </button>

        </div>

          <div className="pos-categories">

            {categories.map(
              (item) => (
                <button
                  key={item}
                  className={
                    category ===
                    item
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setCategory(
                      item,
                    )
                  }
                >
                  {item}
                </button>
              ),
            )}

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
  <div className="product-manager-overlay">

    <div className="product-manager">

      <header className="product-manager-header">

        <div>
          <h2>Gestisci prodotti</h2>

          <p>
            Crea e gestisci i prodotti del POS
          </p>
        </div>

        <button
          className="close-manager"
          onClick={() => {
            setShowProductManager(false);
            closeProductForm();
          }}
        >
          <X size={20} />
        </button>

      </header>

      <div className="product-manager-content">

        <div className="manager-toolbar">

          <strong>
            {products.length}{' '}
            {products.length === 1
              ? 'prodotto'
              : 'prodotti'}
          </strong>

          <button
            className="new-product-button"
            onClick={openCreateProduct}
          >
            <PlusCircle size={18} />
            Nuovo prodotto
          </button>

        </div>

        {!editingProduct &&
        productForm.name === '' ? (
          <div className="manager-products-list">

            {products.length === 0 ? (
              <div className="manager-empty">

                <Package size={42} />

                <h3>
                  Nessun prodotto
                </h3>

                <p>
                  Crea il primo prodotto
                  del tuo POS.
                </p>

              </div>
            ) : (
              products.map((product) => (
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
                        src={product.imageUrl}
                        alt={product.name}
                      />
                    ) : (
                      <Package
                        size={28}
                      />
                    )}

                  </div>

                  <div className="manager-product-info">

                    <strong>
                      {product.name}
                    </strong>

                    <span>
                      {product.category ||
                        'Senza categoria'}
                    </span>

                    <small>
                      €{' '}
                      {Number(
                        product.price,
                      ).toFixed(2)}{' '}
                      ·{' '}
                      {product.stock}{' '}
                      disponibili
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
                        size={17}
                      />
                      Modifica
                    </button>

                    <button
                      className={
                        product.status ===
                        'ACTIVE'
                          ? 'danger'
                          : 'success'
                      }
                      onClick={() =>
                        toggleProduct(
                          product,
                        )
                      }
                    >
                      <Power
                        size={17}
                      />

                      {product.status ===
                      'ACTIVE'
                        ? 'Disattiva'
                        : 'Attiva'}
                    </button>

                  </div>

                </div>
              ))
            )}

          </div>
        ) : (
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
                  Inserisci i dati del
                  prodotto.
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
                  type="text"
                  value={
                    productForm.name
                  }
                  onChange={(event) =>
                    setProductForm(
                      (current) => ({
                        ...current,
                        name: event.target
                          .value,
                      }),
                    )
                  }
                  placeholder="Es. Coca-Cola"
                />
              </label>

              <label>
                Categoria

                <input
                  type="text"
                  value={
                    productForm.category
                  }
                  onChange={(event) =>
                    setProductForm(
                      (current) => ({
                        ...current,
                        category:
                          event.target
                            .value,
                      }),
                    )
                  }
                  placeholder="Es. Bevande"
                />
              </label>

              <label>
                Prezzo

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    productForm.price
                  }
                  onChange={(event) =>
                    setProductForm(
                      (current) => ({
                        ...current,
                        price:
                          event.target
                            .value,
                      }),
                    )
                  }
                  placeholder="3.00"
                />
              </label>

              <label>
                Quantità

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={
                    productForm.stock
                  }
                  onChange={(event) =>
                    setProductForm(
                      (current) => ({
                        ...current,
                        stock:
                          event.target
                            .value,
                      }),
                    )
                  }
                  placeholder="100"
                />
              </label>

              <label className="full">
                URL immagine

                <input
                  type="url"
                  value={
                    productForm.imageUrl
                  }
                  onChange={(event) =>
                    setProductForm(
                      (current) => ({
                        ...current,
                        imageUrl:
                          event.target
                            .value,
                      }),
                    )
                  }
                  placeholder="https://..."
                />
              </label>

              <label className="full">
                Descrizione

                <textarea
                  value={
                    productForm.description
                  }
                  onChange={(event) =>
                    setProductForm(
                      (current) => ({
                        ...current,
                        description:
                          event.target
                            .value,
                      }),
                    )
                  }
                  placeholder="Descrizione opzionale"
                  rows={3}
                />
              </label>

            </div>

            {productForm.imageUrl && (
              <div className="product-preview">

                <span>
                  Anteprima
                </span>

                <img
                  src={
                    productForm.imageUrl
                  }
                  alt="Anteprima"
                />

              </div>
            )}

            <button
              className="save-product-button"
              type="submit"
              disabled={savingProduct}
            >
              {savingProduct
                ? 'Salvataggio...'
                : editingProduct
                  ? 'Salva modifiche'
                  : 'Crea prodotto'}
            </button>

          </form>
        )}

      </div>

    </div>

  </div>
)}

    </div>
  );
}