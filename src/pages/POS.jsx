import { useEffect, useMemo, useState } from 'react';

import {
  CreditCard,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Settings,
  X,
  PlusCircle,
  Pencil,
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
  const { festival } = useFestival();

  // ==========================================================
  // PRODUCTS
  // ==========================================================

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  // ==========================================================
  // CART
  // ==========================================================

  const [cart, setCart] = useState([]);

  const [category, setCategory] = useState('Tutti');

  const [paying, setPaying] = useState(false);

  // ==========================================================
  // PRODUCT MANAGER
  // ==========================================================

  const [showProductManager, setShowProductManager] =
    useState(false);

  const [showProductForm, setShowProductForm] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [savingProduct, setSavingProduct] =
    useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    category: '',
    price: '',
    stock: '',
  });

  // ==========================================================
  // LOAD PRODUCTS
  // ==========================================================

  async function loadProducts() {
    if (!festival?.id) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getPosProducts(
        festival.id,
      );

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        'Errore caricamento prodotti:',
        error,
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [festival?.id]);

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      products
        .map((product) => product.category)
        .filter(Boolean),
    );

    return [
      'Tutti',
      ...Array.from(uniqueCategories),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (category === 'Tutti') {
      return products;
    }

    return products.filter(
      (product) =>
        product.category === category,
    );
  }, [products, category]);

  // ==========================================================
  // TOTAL
  // ==========================================================

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
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
  // ADD TO CART
  // ==========================================================

  function addToCart(product) {
    if (product.stock <= 0) {
      return;
    }

    setCart((current) => {
      const existing = current.find(
        (item) =>
          item.id === product.id,
      );

      if (existing) {
        if (
          existing.quantity >=
          product.stock
        ) {
          return current;
        }

        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
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

  function decrease(productId) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
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

  function increase(productId) {
    setCart((current) =>
      current.map((item) => {
        if (
          item.id !== productId
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
          item.id !== productId,
      ),
    );
  }

  // ==========================================================
  // RESET PRODUCT FORM
  // ==========================================================

  function resetProductForm() {
    setProductForm({
      name: '',
      description: '',
      imageUrl: '',
      category: '',
      price: '',
      stock: '',
    });

    setEditingProduct(null);
  }

  // ==========================================================
  // OPEN CREATE PRODUCT
  // ==========================================================

  function openCreateProduct() {
    resetProductForm();

    setShowProductForm(true);
  }

  // ==========================================================
  // OPEN EDIT PRODUCT
  // ==========================================================

  function openEditProduct(product) {
    setEditingProduct(product);

    setProductForm({
      name: product.name || '',
      description:
        product.description || '',
      imageUrl:
        product.imageUrl || '',
      category:
        product.category || '',
      price:
        product.price ?? '',
      stock:
        product.stock ?? '',
    });

    setShowProductForm(true);
  }

  // ==========================================================
  // SAVE PRODUCT
  // ==========================================================

  async function saveProduct() {
    if (!festival?.id) {
      alert(
        'Nessun festival selezionato.',
      );
      return;
    }

    const name =
      productForm.name.trim();

    if (!name) {
      alert(
        'Inserisci il nome del prodotto.',
      );
      return;
    }

    if (
      productForm.price === '' ||
      Number(productForm.price) < 0
    ) {
      alert(
        'Inserisci un prezzo valido.',
      );
      return;
    }

    if (
      productForm.stock === '' ||
      Number(productForm.stock) < 0
    ) {
      alert(
        'Inserisci una quantità valida.',
      );
      return;
    }

    try {
      setSavingProduct(true);

      const payload = {
        festivalId:
          festival.id,

        name,

        description:
          productForm.description.trim() ||
          undefined,

        imageUrl:
          productForm.imageUrl.trim() ||
          undefined,

        category:
          productForm.category.trim() ||
          undefined,

        price: Number(
          productForm.price,
        ),

        stock: Number(
          productForm.stock,
        ),
      };

      if (editingProduct) {
        await updatePosProduct(
          editingProduct.id,
          payload,
        );
      } else {
        await createPosProduct(
          payload,
        );
      }

      setShowProductForm(false);

      resetProductForm();

      await loadProducts();
    } catch (error) {
      console.error(
        'Errore salvataggio prodotto:',
        error,
      );

      alert(
        error.message ||
          'Errore durante il salvataggio del prodotto.',
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
      !festival?.id
    ) {
      return;
    }

    try {
      setPaying(true);

      await createPosTransaction({
        festivalId:
          festival.id,

        paymentMethod: 'CASH',

        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      setCart([]);

      await loadProducts();
    } catch (error) {
      console.error(
        'Errore pagamento:',
        error,
      );

      alert(
        error.message ||
          'Pagamento non riuscito.',
      );
    } finally {
      setPaying(false);
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="pos-page">

      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="pos-main">

        {/* HEADER */}

        <header className="pos-header">

          <div>
            <h1>POS</h1>

            <p>
              Gestione vendite
            </p>
          </div>

          <div className="pos-header-actions">

            <button
              type="button"
              className="add-product-button"
              onClick={() =>
                setShowProductManager(
                  !showProductManager,
                )
              }
            >
              <Settings size={17} />

              Gestisci prodotti
            </button>

          </div>

        </header>

        {/* ===================================================
            PRODUCT MANAGER
            =================================================== */}

        {showProductManager && (
          <section className="product-manager">

            <div className="product-manager-header">

              <div>
                <h2>
                  Gestione prodotti
                </h2>

                <p>
                  Aggiungi e modifica i
                  prodotti disponibili
                  nel POS.
                </p>
              </div>

              <button
                type="button"
                className="add-product-button"
                onClick={
                  openCreateProduct
                }
              >
                <PlusCircle
                  size={17}
                />

                Aggiungi prodotto
              </button>

            </div>

            {products.length === 0 ? (
              <div className="product-manager-empty">

                <ShoppingCart
                  size={35}
                />

                <strong>
                  Nessun prodotto
                </strong>

                <span>
                  Crea il primo prodotto
                  per iniziare.
                </span>

              </div>
            ) : (
              <div className="product-manager-list">

                {products.map(
                  (product) => (
                    <div
                      className="product-manager-item"
                      key={
                        product.id
                      }
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
                            size={25}
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

                      <button
                        type="button"
                        className="edit-product-button"
                        onClick={() =>
                          openEditProduct(
                            product,
                          )
                        }
                      >
                        <Pencil
                          size={16}
                        />

                        Modifica
                      </button>

                    </div>
                  ),
                )}

              </div>
            )}

          </section>
        )}

        {/* ===================================================
            CATEGORIES
            =================================================== */}

        <div className="pos-categories">

          {categories.map(
            (item) => (
              <button
                type="button"
                key={item}
                className={
                  category === item
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setCategory(item)
                }
              >
                {item}
              </button>
            ),
          )}

        </div>

        {/* ===================================================
            PRODUCTS GRID
            =================================================== */}

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
                dal gestore prodotti.
              </p>

            </div>
          ) : (
            filteredProducts.map(
              (product) => (
                <button
                  type="button"
                  key={product.id}
                  className={`product-card ${
                    product.stock <= 0
                      ? 'sold-out'
                      : ''
                  }`}
                  disabled={
                    product.stock <= 0
                  }
                  onClick={() =>
                    addToCart(product)
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
                      {product.name}
                    </strong>

                    <span>
                      €
                      {' '}
                      {Number(
                        product.price,
                      ).toFixed(2)}
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

      {/* =====================================================
          CART
          ===================================================== */}

      <aside className="pos-cart">

        <header className="cart-header">

          <div>
            <h2>
              Carrello
            </h2>

            <span>
              {cartQuantity}{' '}
              {cartQuantity === 1
                ? 'prodotto'
                : 'prodotti'}
            </span>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setCart([])
              }
            >
              Svuota
            </button>
          )}

        </header>

        {/* CART ITEMS */}

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
                      Number(
                        item.price,
                      ) *
                      item.quantity
                    ).toFixed(2)}
                  </span>

                </div>

                <div className="quantity">

                  <button
                    type="button"
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
                    {item.quantity}
                  </span>

                  <button
                    type="button"
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
                    type="button"
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

        {/* CART FOOTER */}

        <footer className="cart-footer">

          <div className="total">

            <span>
              Totale
            </span>

            <strong>
              €
              {' '}
              {total.toFixed(2)}
            </strong>

          </div>

          <button
            type="button"
            className="pay-button"
            disabled={
              cart.length === 0 ||
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

      {/* =====================================================
          PRODUCT MODAL
          ===================================================== */}

      {showProductForm && (
        <div
          className="product-modal-overlay"
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowProductForm(
                false,
              );
            }
          }}
        >

          <div className="product-modal">

            {/* MODAL HEADER */}

            <div className="product-modal-header">

              <div>
                <h2>
                  {editingProduct
                    ? 'Modifica prodotto'
                    : 'Nuovo prodotto'}
                </h2>

                <p>
                  Inserisci i dati
                  del prodotto.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setShowProductForm(
                    false,
                  )
                }
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <div className="product-form">

              <label>
                Nome prodotto

                <input
                  type="text"
                  value={
                    productForm.name
                  }
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      name:
                        event.target
                          .value,
                    })
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
                    setProductForm({
                      ...productForm,
                      category:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Es. Bevande"
                />
              </label>

              <div className="form-row">

                <label>
                  Prezzo (€)

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      productForm.price
                    }
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        price:
                          event.target
                            .value,
                      })
                    }
                    placeholder="5.00"
                  />
                </label>

                <label>
                  Quantità iniziale

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      productForm.stock
                    }
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        stock:
                          event.target
                            .value,
                      })
                    }
                    placeholder="100"
                  />
                </label>

              </div>

              <label>
                URL immagine

                <input
                  type="url"
                  value={
                    productForm.imageUrl
                  }
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      imageUrl:
                        event.target
                          .value,
                    })
                  }
                  placeholder="https://..."
                />
              </label>

              <label>
                Descrizione

                <textarea
                  value={
                    productForm.description
                  }
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      description:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Descrizione opzionale"
                />
              </label>

            </div>

            {/* ACTIONS */}

            <div className="product-modal-actions">

              <button
                type="button"
                onClick={() =>
                  setShowProductForm(
                    false,
                  )
                }
              >
                Annulla
              </button>

              <button
                type="button"
                disabled={
                  savingProduct
                }
                onClick={
                  saveProduct
                }
              >
                {savingProduct
                  ? 'Salvataggio...'
                  : editingProduct
                    ? 'Salva modifiche'
                    : 'Aggiungi prodotto'}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}