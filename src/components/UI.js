import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { categories } from '../data/storeData';
import { useStore } from '../context/StoreContext';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Shop' },
  { to: '/account', label: 'Account' },
  { to: '/checkout', label: 'Checkout' },
];

function Icon({ children }) {
  return (
    <span className="icon-glyph" aria-hidden="true">
      {children}
    </span>
  );
}

export function Badge({ children, tone = 'default' }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function StarRating({ rating, reviews, compact = false }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const stars = Array.from({ length: 5 }, (_, index) => {
    if (index < fullStars) return '★';
    if (index === fullStars && hasHalf) return '⯪';
    return '☆';
  });

  return (
    <div
      className={`star-rating ${compact ? 'star-rating--compact' : ''}`}
      aria-label={`Rated ${rating} out of 5`}
    >
      <span className="star-rating__stars">{stars.join(' ')}</span>
      <span className="star-rating__value">{rating.toFixed(1)}</span>
      {typeof reviews === 'number' ? <span className="star-rating__count">({reviews})</span> : null}
    </div>
  );
}

export function Skeleton({ variant = 'card', lines = 3 }) {
  if (variant === 'text') {
    return (
      <div className="skeleton skeleton--text">
        {Array.from({ length: lines }, (_, index) => (
          <span key={index} className="skeleton__line" />
        ))}
      </div>
    );
  }

  return (
    <div className="product-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton--media" />
      <div className="skeleton skeleton--text">
        <span className="skeleton__line" />
        <span className="skeleton__line skeleton__line--short" />
        <span className="skeleton__line skeleton__line--tiny" />
      </div>
    </div>
  );
}

export function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
          {index < items.length - 1 ? <span className="breadcrumb__divider">/</span> : null}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function Modal({ isOpen, title, onClose, children }) {
  React.useEffect(() => {
    if (!isOpen) return undefined;
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <h3>{title}</h3>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <Icon>✕</Icon>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ProductCard({ product, showQuickView = false }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [isQuickViewOpen, setQuickViewOpen] = React.useState(false);
  const isWishlisted = wishlist.includes(product.id);

  return (
    <>
      <article className="product-card">
        <div className="product-card__media">
          <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}>
            <img src={product.images[0]} alt={product.name} loading="lazy" />
          </Link>
          <div className="product-card__badges">
            {product.discount ? <Badge tone="accent">Sale</Badge> : null}
            {product.isNew ? <Badge tone="dark">New</Badge> : null}
            {product.stock < 1 ? <Badge tone="muted">Out of Stock</Badge> : null}
          </div>
          <button
            className={`icon-button product-card__wishlist ${isWishlisted ? 'is-active' : ''}`}
            onClick={() => toggleWishlist(product.id)}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Icon>{isWishlisted ? '♥' : '♡'}</Icon>
          </button>
        </div>
        <div className="product-card__content">
          <p className="eyebrow">{product.brand}</p>
          <h3>
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <StarRating rating={product.rating} reviews={product.reviews} compact />
          <div className="product-card__price">
            <strong>${product.price.toFixed(2)}</strong>
            <span>${product.originalPrice.toFixed(2)}</span>
          </div>
          <div className="product-card__actions">
            <button className="button button--primary" onClick={() => addToCart(product)}>
              Add to Cart
            </button>
            {showQuickView ? (
              <button className="button button--ghost" onClick={() => setQuickViewOpen(true)}>
                Quick View
              </button>
            ) : null}
          </div>
        </div>
      </article>
      <Modal isOpen={isQuickViewOpen} title={product.name} onClose={() => setQuickViewOpen(false)}>
        <div className="quick-view">
          <img src={product.images[0]} alt={product.name} />
          <div>
            <p className="eyebrow">{product.category}</p>
            <StarRating rating={product.rating} reviews={product.reviews} />
            <p>{product.description}</p>
            <button className="button button--primary" onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function ToastViewport() {
  const { toasts } = useStore();

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type || 'info'}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export function Navbar() {
  const { cartCount, isMenuOpen, setMenuOpen, setCartOpen, theme, setTheme } = useStore();
  const [query, setQuery] = React.useState('');
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, setMenuOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    const search = query.trim();
    navigate(search ? `/products?search=${encodeURIComponent(search)}` : '/products');
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="brand">
          <span className="brand__mark">N</span>
          <span>
            Nova<span>Mart</span>
          </span>
        </Link>

        <form className="navbar__search" onSubmit={submitSearch} role="search">
          <label className="sr-only" htmlFor="site-search">
            Search products
          </label>
          <input
            id="site-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for audio, gadgets, and more"
          />
          <button className="button button--primary" type="submit">
            Search
          </button>
        </form>

        <nav className={`navbar__links ${isMenuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              {item.label}
            </NavLink>
          ))}
          <Link to="/login" className="navbar__mobile-link">
            Login
          </Link>
        </nav>

        <div className="navbar__actions">
          <button
            className="icon-button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle color theme"
          >
            <Icon>{theme === 'light' ? '☾' : '☀'}</Icon>
          </button>
          <button className="icon-button cart-button" onClick={() => setCartOpen(true)} aria-label="Open cart">
            <Icon>🛒</Icon>
            {cartCount ? <span className="cart-badge">{cartCount}</span> : null}
          </button>
          <Link to="/account" className="icon-button" aria-label="Open account">
            <Icon>👤</Icon>
          </Link>
          <button
            className="icon-button navbar__burger"
            onClick={() => setMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <Icon>{isMenuOpen ? '✕' : '☰'}</Icon>
          </button>
        </div>
      </div>
      {isMenuOpen ? (
        <div className="navbar__drawer">
          <div className="container navbar__drawer-content">
            {categories.slice(0, 4).map((category) => (
              <Link key={category.id} to={`/products?category=${encodeURIComponent(category.name)}`}>
                {category.icon} {category.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function CartDrawer() {
  const { cart, isCartOpen, setCartOpen, updateCartQuantity, removeFromCart, subtotal } = useStore();

  return (
    <div className={`cart-drawer ${isCartOpen ? 'is-open' : ''}`} aria-hidden={!isCartOpen}>
      <button className="cart-drawer__overlay" onClick={() => setCartOpen(false)} aria-label="Close cart drawer" />
      <aside className="cart-drawer__panel">
        <div className="cart-drawer__header">
          <h3>Your Cart</h3>
          <button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close cart">
            <Icon>✕</Icon>
          </button>
        </div>
        <div className="cart-drawer__body">
          {cart.length ? (
            cart.map((item) => (
              <div className="drawer-item" key={item.cartKey}>
                <img src={item.images[0]} alt={item.name} />
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    {item.color} / {item.size}
                  </p>
                  <div className="quantity-stepper">
                    <button onClick={() => updateCartQuantity(item.cartKey, item.quantity - 1)} aria-label="Decrease quantity">
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.cartKey, item.quantity + 1)} aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                </div>
                <div className="drawer-item__meta">
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                  <button className="link-button" onClick={() => removeFromCart(item.cartKey)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state compact">
              <p>Your cart is feeling light.</p>
              <Link className="button button--primary" to="/products" onClick={() => setCartOpen(false)}>
                Explore Products
              </Link>
            </div>
          )}
        </div>
        <div className="cart-drawer__footer">
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>
          <Link className="button button--ghost" to="/cart" onClick={() => setCartOpen(false)}>
            View Cart
          </Link>
          <Link className="button button--primary" to="/checkout" onClick={() => setCartOpen(false)}>
            Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <h3>NovaMart</h3>
          <p>Design-led shopping for modern essentials, delivered fast.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/checkout">Checkout</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/account">Account</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
        <div>
          <h4>Payments</h4>
          <p>Visa • Mastercard • PayPal • Apple Pay</p>
          <div className="footer__socials" aria-label="Social links">
            <a href="https://example.com">Instagram</a>
            <a href="https://example.com">Twitter</a>
            <a href="https://example.com">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
