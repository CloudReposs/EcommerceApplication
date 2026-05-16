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
              Add to Cart
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
  const [orders, setOrders] = useState([]);
  
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [fetchingCart, setFetchingCart] = useState(false);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const [toast, setToast] = useState(null);

  // Checkout state
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutMobile, setCheckoutMobile] = useState('');
  const [checkoutPaymentDone, setCheckoutPaymentDone] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = useCallback(() => setToast(null), []);

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
      showToast('Failed to fetch products.', 'error');
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

  const fetchOrders = async () => {
    setFetchingOrders(true);
    try {
      const res = await fetch(`${API}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch {
      showToast('Failed to fetch orders.', 'error');
    } finally {
      setFetchingOrders(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, [fetchCart]);

  const handleAdd = async (productId) => {
    try {
      const res = await fetch(`${API}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        showToast('Added to cart');
        fetchCart();
      } else {
        showToast('Failed to add item.', 'error');
      }
    } catch {
      showToast('Error connecting to server.', 'error');
    }
  };

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
      } else {
        showToast('Failed to update quantity.', 'error');
      }
    } catch {
      showToast('Error connecting to server.', 'error');
    }
  };

  const handleDecrease = async (cartItemId, currentQty) => {
    if (currentQty <= 1) {
      try {
        const res = await fetch(`${API}/cart/${cartItemId}`, { method: 'DELETE' });
        if (res.ok) {
          setCartItems((prev) => prev.filter((i) => i._id !== cartItemId));
          showToast('Removed from cart');
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
        } else {
          showToast('Failed to update quantity.', 'error');
        }
      } catch {
        showToast('Error connecting to server.', 'error');
      }
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      const res = await fetch(`${API}/cart/${cartItemId}`, { method: 'DELETE' });
      if (res.ok) {
        setCartItems((prev) => prev.filter((i) => i._id !== cartItemId));
        showToast('Item removed');
      } else {
        showToast('Failed to remove item.', 'error');
      }
    } catch {
      showToast('Error connecting to server.', 'error');
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) { 
      showToast('Your cart is empty.', 'error'); 
      return; 
    }
    setPage('checkout');
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!checkoutAddress || !checkoutMobile || !checkoutPaymentDone) {
      showToast('Please fill all details and confirm payment.', 'error');
      return;
    }

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
        body: JSON.stringify({ 
          items, 
          totalAmount,
          address: checkoutAddress,
          mobile: checkoutMobile,
          paymentDone: checkoutPaymentDone
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Order placed successfully.');
        setCartItems([]);
        setCheckoutAddress('');
        setCheckoutMobile('');
        setCheckoutPaymentDone(false);
        setPage('orders');
        fetchOrders();
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

      <header className="header">
        <div className="header-brand">
          <span className="brand-name">ShopEasy.</span>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-btn${page === 'products' ? ' active' : ''}`}
            onClick={() => { setPage('products'); fetchProducts(); fetchCart(); }}
          >
            Products
          </button>
          <button
            className={`nav-btn${page === 'cart' || page === 'checkout' ? ' active' : ''}`}
            onClick={() => { setPage('cart'); fetchCart(); }}
          >
            Cart
            {totalItemsInCart > 0 && (
              <span className="cart-badge">{totalItemsInCart}</span>
            )}
          </button>
          <button
            className={`nav-btn${page === 'orders' ? ' active' : ''}`}
            onClick={() => { setPage('orders'); fetchOrders(); }}
          >
            Orders
          </button>
        </nav>
      </header>

      {/* Products Page */}
      {page === 'products' && (
        <main className="main">
          <div className="page-title">
            <h2>Collection</h2>
            <p className="page-sub">{products.length} items available</p>
          </div>
          {fetchingProducts && <div className="spinner-wrap"><div className="spinner"></div></div>}
          {!fetchingProducts && products.length === 0 && (
            <p className="empty">No products found.</p>
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
            <h2>Shopping Cart</h2>
            <p className="page-sub">{totalItemsInCart} item{totalItemsInCart !== 1 ? 's' : ''}</p>
          </div>
          {fetchingCart && <div className="spinner-wrap"><div className="spinner"></div></div>}
          {!fetchingCart && cartItems.length === 0 && (
            <div className="empty-cart">
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
                      src={item.productId?.image || 'https://placehold.co/80x80?text=No+Image'}
                      alt={item.productId?.name}
                      className="cart-item-img"
                      onError={(e) => { e.target.src = 'https://placehold.co/80x80?text=No+Image'; }}
                    />
                    <div className="cart-item-info">
                      <h4>{item.productId?.name}</h4>
                      <p className="unit-price">₹{item.productId?.price?.toLocaleString()}</p>
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
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <h3>Summary</h3>
                <div className="summary-row">
                  <span>Subtotal ({totalItemsInCart} items)</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="summary-row summary-total">
                  <span>Total Amount</span>
                  <strong>₹{cartTotal.toLocaleString()}</strong>
                </div>
                <button className="btn-order" onClick={handleProceedToCheckout}>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Checkout Page */}
      {page === 'checkout' && (
        <main className="main">
          <div className="page-title">
            <h2>Checkout</h2>
            <p className="page-sub">Complete your details to place the order.</p>
          </div>
          <div className="checkout-layout">
            <form className="checkout-form" onSubmit={placeOrder}>
              <div className="form-group">
                <label>Delivery Address</label>
                <textarea 
                  required
                  rows="3"
                  value={checkoutAddress} 
                  onChange={e => setCheckoutAddress(e.target.value)} 
                  placeholder="Enter full address"
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input 
                  type="tel"
                  required
                  value={checkoutMobile} 
                  onChange={e => setCheckoutMobile(e.target.value)} 
                  placeholder="Enter 10-digit mobile number"
                />
              </div>
              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="paymentDone"
                  required
                  checked={checkoutPaymentDone}
                  onChange={e => setCheckoutPaymentDone(e.target.checked)}
                />
                <label htmlFor="paymentDone">I confirm that payment is done</label>
              </div>
              <div className="checkout-actions">
                <button type="button" className="btn-secondary" onClick={() => setPage('cart')}>Back to Cart</button>
                <button type="submit" className="btn-primary">Confirm Order (₹{cartTotal.toLocaleString()})</button>
              </div>
            </form>
          </div>
        </main>
      )}

      {/* Orders Page */}
      {page === 'orders' && (
        <main className="main">
          <div className="page-title">
            <h2>Order History</h2>
            <p className="page-sub">Review your past orders.</p>
          </div>
          {fetchingOrders && <div className="spinner-wrap"><div className="spinner"></div></div>}
          {!fetchingOrders && orders.length === 0 && (
            <div className="empty-state">
              <p>You haven't placed any orders yet.</p>
              <button className="btn-shop" onClick={() => setPage('products')}>Browse Products</button>
            </div>
          )}
          {orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order) => (
                <div className="order-card" key={order._id}>
                  <div className="order-header">
                    <div className="order-meta">
                      <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                      <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="order-status">
                      <span className="status-badge success">Payment Done</span>
                    </div>
                  </div>
                  <div className="order-details">
                    <p><strong>Deliver to:</strong> {order.address}</p>
                    <p><strong>Contact:</strong> {order.mobile}</p>
                  </div>
                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div className="order-item-row" key={idx}>
                        <span>{item.quantity} × {item.name}</span>
                        <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-footer">
                    <span>Total Amount</span>
                    <strong>₹{order.totalAmount.toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      <footer className="footer">
        <p>ShopEasy &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
