import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const API = import.meta.env.VITE_API_URL || '';

// ── Toast ────────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type}`}>
      <span>{toast.message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}

// ── Product Card ─────────────────────────────────────────────────────
function ProductCard({ product, cartEntry, onAdd, onIncrease, onDecrease }) {
  const inCart = cartEntry && cartEntry.quantity > 0;

  return (
    <div className={`product-card${inCart ? ' product-card--in-cart' : ''}`}>
      {inCart && <div className="in-cart-badge">In Cart</div>}
      <img
        src={product.image || 'https://placehold.co/400x220?text=No+Image'}
        alt={product.name}
        className="product-image"
        onError={(e) => { e.target.src = 'https://placehold.co/400x220?text=No+Image'; }}
      />
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <p className="product-price">₹{product.price.toLocaleString()}</p>

        <div className="product-actions">
          {inCart ? (
            <div className="qty-row">
              <button
                className="qty-btn qty-btn--minus"
                onClick={() => onDecrease(cartEntry.cartItemId, cartEntry.quantity)}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="qty-display">{cartEntry.quantity}</span>
              <button
                className="qty-btn qty-btn--plus"
                onClick={() => onIncrease(cartEntry.cartItemId, cartEntry.quantity)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <button className="btn-add" onClick={() => onAdd(product._id)}>
              + Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────
function App() {
  const [page, setPage] = useState('products');
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [fetchingCart, setFetchingCart] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = useCallback(() => setToast(null), []);

  // cartMap: productId → { cartItemId, quantity }
  const cartMap = cartItems.reduce((map, item) => {
    if (item.productId?._id) {
      map[item.productId._id] = { cartItemId: item._id, quantity: item.quantity };
    }
    return map;
  }, {});

  const totalItemsInCart = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.productId?.price || 0) * item.quantity, 0
  );

  const fetchProducts = async () => {
    setFetchingProducts(true);
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      setProducts(data);
    } catch {
      showToast('Failed to fetch products. Is the server running?', 'error');
    } finally {
      setFetchingProducts(false);
    }
  };

  const fetchCart = useCallback(async () => {
    setFetchingCart(true);
    try {
      const res = await fetch(`${API}/cart`);
      const data = await res.json();
      setCartItems(data);
    } catch {
      showToast('Failed to fetch cart.', 'error');
    } finally {
      setFetchingCart(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, [fetchCart]);

  // Add a product to cart (first time)
  const handleAdd = async (productId) => {
    try {
      const res = await fetch(`${API}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        showToast('Added to cart!');
        fetchCart();
      } else {
        showToast('Failed to add item.', 'error');
      }
    } catch {
      showToast('Error connecting to server.', 'error');
    }
  };

  // Increase qty of existing cart item
  const handleIncrease = async (cartItemId, currentQty) => {
    try {
      const res = await fetch(`${API}/cart/${cartItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: currentQty + 1 }),
      });
      if (res.ok) {
        setCartItems((prev) =>
          prev.map((i) => i._id === cartItemId ? { ...i, quantity: currentQty + 1 } : i)
        );
        showToast('Quantity updated!');
      } else {
        showToast('Failed to update quantity.', 'error');
      }
    } catch {
      showToast('Error connecting to server.', 'error');
    }
  };

  // Decrease qty — remove if qty reaches 0
  const handleDecrease = async (cartItemId, currentQty) => {
    if (currentQty <= 1) {
      try {
        const res = await fetch(`${API}/cart/${cartItemId}`, { method: 'DELETE' });
        if (res.ok) {
          setCartItems((prev) => prev.filter((i) => i._id !== cartItemId));
          showToast('Removed from cart.');
        } else {
          showToast('Failed to remove item.', 'error');
        }
      } catch {
        showToast('Error connecting to server.', 'error');
      }
    } else {
      try {
        const res = await fetch(`${API}/cart/${cartItemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: currentQty - 1 }),
        });
        if (res.ok) {
          setCartItems((prev) =>
            prev.map((i) => i._id === cartItemId ? { ...i, quantity: currentQty - 1 } : i)
          );
          showToast('Quantity updated.');
        } else {
          showToast('Failed to update quantity.', 'error');
        }
      } catch {
        showToast('Error connecting to server.', 'error');
      }
    }
  };

  // Remove from cart page
  const handleRemove = async (cartItemId) => {
    try {
      const res = await fetch(`${API}/cart/${cartItemId}`, { method: 'DELETE' });
      if (res.ok) {
        setCartItems((prev) => prev.filter((i) => i._id !== cartItemId));
        showToast('Item removed from cart.');
      } else {
        showToast('Failed to remove item.', 'error');
      }
    } catch {
      showToast('Error connecting to server.', 'error');
    }
  };

  // Place order
  const placeOrder = async () => {
    if (cartItems.length === 0) { showToast('Your cart is empty!', 'error'); return; }

    const items = cartItems.map((item) => ({
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
    }));
    const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);

    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, totalAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('🎉 Order placed successfully!');
        setCartItems([]);
        setPage('products');
      } else {
        showToast(data.error || 'Failed to place order.', 'error');
      }
    } catch {
      showToast('Error placing order.', 'error');
    }
  };

  return (
    <div className="app">
      <Toast toast={toast} onClose={closeToast} />

      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <span className="brand-icon">🛒</span>
          <span className="brand-name">ShopEasy</span>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-btn${page === 'products' ? ' active' : ''}`}
            onClick={() => { setPage('products'); fetchProducts(); fetchCart(); }}
          >
            Products
          </button>
          <button
            className={`nav-btn${page === 'cart' ? ' active' : ''}`}
            onClick={() => { setPage('cart'); fetchCart(); }}
          >
            Cart
            {totalItemsInCart > 0 && (
              <span className="cart-badge">{totalItemsInCart}</span>
            )}
          </button>
        </nav>
      </header>

      {/* Products Page */}
      {page === 'products' && (
        <main className="main">
          <div className="page-title">
            <h2>Available Products</h2>
            <p className="page-sub">{products.length} items available</p>
          </div>
          {fetchingProducts && <div className="spinner-wrap"><div className="spinner"></div></div>}
          {!fetchingProducts && products.length === 0 && (
            <p className="empty">No products found. Is the server running?</p>
          )}
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                cartEntry={cartMap[product._id] || null}
                onAdd={handleAdd}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
              />
            ))}
          </div>
        </main>
      )}

      {/* Cart Page */}
      {page === 'cart' && (
        <main className="main">
          <div className="page-title">
            <h2>Your Cart</h2>
            <p className="page-sub">{totalItemsInCart} item{totalItemsInCart !== 1 ? 's' : ''}</p>
          </div>
          {fetchingCart && <div className="spinner-wrap"><div className="spinner"></div></div>}
          {!fetchingCart && cartItems.length === 0 && (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <p>Your cart is empty.</p>
              <button className="btn-shop" onClick={() => setPage('products')}>Browse Products</button>
            </div>
          )}
          {cartItems.length > 0 && (
            <div className="cart-layout">
              <div className="cart-list">
                {cartItems.map((item) => (
                  <div className="cart-item" key={item._id}>
                    <img
                      src={item.productId?.image || 'https://placehold.co/80x80?text=?'}
                      alt={item.productId?.name}
                      className="cart-item-img"
                      onError={(e) => { e.target.src = 'https://placehold.co/80x80?text=?'; }}
                    />
                    <div className="cart-item-info">
                      <h4>{item.productId?.name}</h4>
                      <p className="unit-price">₹{item.productId?.price?.toLocaleString()} each</p>
                    </div>
                    <div className="qty-controls">
                      <button
                        className="qty-btn qty-btn--minus"
                        onClick={() => handleDecrease(item._id, item.quantity)}
                        disabled={item.quantity <= 0}
                      >−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn qty-btn--plus"
                        onClick={() => handleIncrease(item._id, item.quantity)}
                      >+</button>
                    </div>
                    <div className="cart-item-right">
                      <span className="cart-item-total">
                        ₹{((item.productId?.price || 0) * item.quantity).toLocaleString()}
                      </span>
                      <button className="btn-remove" onClick={() => handleRemove(item._id)}>
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Items ({totalItemsInCart})</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="summary-row summary-total">
                  <span>Total</span>
                  <strong>₹{cartTotal.toLocaleString()}</strong>
                </div>
                <button className="btn-order" onClick={placeOrder}>
                  Place Order →
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      <footer className="footer">
        <p>ShopEasy &copy; 2025 — MERN E-Commerce App</p>
      </footer>
    </div>
  );
}

export default App;
