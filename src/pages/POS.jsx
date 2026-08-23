import { useEffect, useMemo, useState } from 'react';

import {
  CreditCard,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

import {
  createPosTransaction,
  getPosProducts,
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

  const filteredProducts =
    useMemo(() => {
      if (category === 'Tutti') {
        return products;
      }

      return products.filter(
        (product) =>
          product.category ===
          category,
      );
    }, [products, category]);

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

    </div>
  );
}