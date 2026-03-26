import React from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Badge,
  Breadcrumb,
  Footer,
  ProductCard,
  Skeleton,
  StarRating,
} from '../components/UI';
import { useStore } from '../context/StoreContext';
import { categories, orderHistory, products, reviews } from '../data/storeData';

function useLoading(delay = 700) {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  return loading;
}

function ProductGrid({ items, quickView }) {
  return (
    <div className="product-grid">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} showQuickView={quickView} />
      ))}
    </div>
  );
}

function Newsletter() {
  return (
    <section className="newsletter container">
      <div>
        <p className="eyebrow">Newsletter</p>
        <h2>Get fresh drops, offers, and insider product picks.</h2>
      </div>
      <form className="newsletter__form">
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input id="newsletter-email" type="email" placeholder="Your email address" />
        <button className="button button--primary" type="submit">
          Subscribe
        </button>
      </form>
    </section>
  );
}

export function HomePage() {
  const loading = useLoading();
  const featuredProducts = products.slice(0, 4);
  const trendingProducts = products.slice(0, 6);

  return (
    <>
      <main>
        <section className="hero">
          <div className="container hero__content">
            <div>
              <p className="eyebrow">Spring collection 2026</p>
              <h1>Shop elevated tech and lifestyle essentials.</h1>
              <p>
                Curated devices, premium accessories, and home upgrades designed to make everyday moments feel sharper.
              </p>
              <div className="hero__actions">
                <Link className="button button--primary" to="/products">
                  Shop Now
                </Link>
                <Link className="button button--ghost" to="/product/1">
                  View Bestseller
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section container">
          <div className="section__heading">
            <div>
              <p className="eyebrow">Featured categories</p>
              <h2>Find your next favorite setup.</h2>
            </div>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                className="category-card"
                to={`/products?category=${encodeURIComponent(category.name)}`}
              >
                <img src={category.image} alt={category.name} loading="lazy" />
                <div className="category-card__overlay">
                  <span>{category.icon}</span>
                  <h3>{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section section--muted">
          <div className="container">
            <div className="section__heading">
              <div>
                <p className="eyebrow">Trending products</p>
                <h2>What shoppers are adding to cart right now.</h2>
              </div>
              <Link to="/products">View all</Link>
            </div>
            {loading ? (
              <div className="product-grid product-grid--scroll">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="product-grid product-grid--scroll">
                {trendingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} showQuickView />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="container promo-banner">
          <div>
            <p className="eyebrow">Limited time</p>
            <h2>50% OFF select accessories and workspace bundles.</h2>
          </div>
          <Link className="button button--light" to="/products?sort=rating">
            Shop the deal
          </Link>
        </section>

        <section className="section container">
          <div className="section__heading">
            <div>
              <p className="eyebrow">Editor picks</p>
              <h2>Premium picks we’d recommend first.</h2>
            </div>
          </div>
          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} />
              ))}
            </div>
          ) : (
            <ProductGrid items={featuredProducts} />
          )}
        </section>

        <Newsletter />
      </main>
      <Footer />
    </>
  );
}

export function ProductsPage() {
  const loading = useLoading();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialSort = searchParams.get('sort') || 'featured';
  const [selectedCategories, setSelectedCategories] = React.useState(initialCategory ? [initialCategory] : []);
  const [priceRange, setPriceRange] = React.useState(1000);
  const [minimumRating, setMinimumRating] = React.useState(0);
  const [brands, setBrands] = React.useState([]);
  const [sort, setSort] = React.useState(initialSort);
  const [visibleCount, setVisibleCount] = React.useState(8);

  const availableBrands = [...new Set(products.map((product) => product.brand))];
  const availableCategories = [...new Set(products.map((product) => product.category))];

  const filteredProducts = React.useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();
    const nextProducts = products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch) ||
        product.brand.toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        !selectedCategories.length || selectedCategories.includes(product.category);
      const matchesPrice = product.price <= priceRange;
      const matchesRating = product.rating >= minimumRating;
      const matchesBrand = !brands.length || brands.includes(product.brand);
      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesBrand;
    });

    const sorted = [...nextProducts];
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    if (sort === 'newest') sorted.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
    return sorted;
  }, [brands, minimumRating, priceRange, searchTerm, selectedCategories, sort]);

  React.useEffect(() => {
    const nextParams = new URLSearchParams();
    if (searchTerm) nextParams.set('search', searchTerm);
    if (selectedCategories[0]) nextParams.set('category', selectedCategories[0]);
    if (sort !== 'featured') nextParams.set('sort', sort);
    setSearchParams(nextParams, { replace: true });
  }, [searchTerm, selectedCategories, setSearchParams, sort]);

  const activeFilters = [
    ...selectedCategories.map((category) => ({ type: 'category', value: category })),
    ...brands.map((brand) => ({ type: 'brand', value: brand })),
    ...(minimumRating ? [{ type: 'rating', value: `${minimumRating}+ stars` }] : []),
  ];

  return (
    <>
      <main className="section section--top">
        <div className="container">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Products' }]} />
          <div className="section__heading">
            <div>
              <p className="eyebrow">Shop catalog</p>
              <h1>Explore premium products across every category.</h1>
            </div>
            <div className="listing-toolbar">
              <label htmlFor="sort-select">Sort by</label>
              <select id="sort-select" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price Low-High</option>
                <option value="rating">Rating</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <div className="listing-layout">
            <aside className="filters">
              <div className="filter-group">
                <h3>Category</h3>
                {availableCategories.map((category) => (
                  <label key={category} className="checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() =>
                        setSelectedCategories((current) =>
                          current.includes(category)
                            ? current.filter((item) => item !== category)
                            : [...current, category]
                        )
                      }
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>

              <div className="filter-group">
                <h3>Price range</h3>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={priceRange}
                  onChange={(event) => setPriceRange(Number(event.target.value))}
                  aria-label="Price range"
                />
                <p>Up to ${priceRange}</p>
              </div>

              <div className="filter-group">
                <h3>Rating</h3>
                {[4, 3, 2].map((value) => (
                  <button
                    key={value}
                    className={`filter-pill ${minimumRating === value ? 'is-active' : ''}`}
                    onClick={() => setMinimumRating(minimumRating === value ? 0 : value)}
                  >
                    {value}+ stars
                  </button>
                ))}
              </div>

              <div className="filter-group">
                <h3>Brand</h3>
                {availableBrands.map((brand) => (
                  <label key={brand} className="checkbox">
                    <input
                      type="checkbox"
                      checked={brands.includes(brand)}
                      onChange={() =>
                        setBrands((current) =>
                          current.includes(brand)
                            ? current.filter((item) => item !== brand)
                            : [...current, brand]
                        )
                      }
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </aside>

            <section>
              {activeFilters.length ? (
                <div className="active-filters">
                  {activeFilters.map((filter) => (
                    <button
                      key={`${filter.type}-${filter.value}`}
                      className="filter-tag"
                      onClick={() => {
                        if (filter.type === 'category') {
                          setSelectedCategories((current) => current.filter((item) => item !== filter.value));
                        } else if (filter.type === 'brand') {
                          setBrands((current) => current.filter((item) => item !== filter.value));
                        } else {
                          setMinimumRating(0);
                        }
                      }}
                    >
                      {filter.value} ✕
                    </button>
                  ))}
                </div>
              ) : null}

              {loading ? (
                <div className="product-grid">
                  {Array.from({ length: 8 }, (_, index) => (
                    <Skeleton key={index} />
                  ))}
                </div>
              ) : (
                <>
                  <ProductGrid items={filteredProducts.slice(0, visibleCount)} quickView />
                  {!filteredProducts.length ? (
                    <div className="empty-state">
                      <h3>No products matched those filters.</h3>
                      <p>Try clearing a few filters or searching a broader term.</p>
                    </div>
                  ) : null}
                  {visibleCount < filteredProducts.length ? (
                    <div className="load-more">
                      <button className="button button--ghost" onClick={() => setVisibleCount((count) => count + 4)}>
                        Load More
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const product = products.find((item) => item.id === Number(id)) || products[0];
  const productReviews = reviews.filter((review) => review.productId === product.id);
  const relatedProducts = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);
  const [activeImage, setActiveImage] = React.useState(product.images[0]);
  const [activeTab, setActiveTab] = React.useState('description');
  const [color, setColor] = React.useState(product.colors[0] || 'Default');
  const [size, setSize] = React.useState(product.sizes[0] || 'Standard');
  const [quantity, setQuantity] = React.useState(1);
  const isWishlisted = wishlist.includes(product.id);
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    value: Math.max(8, Math.round((product.rating / 5) * 100 - (5 - star) * 12)),
  }));

  React.useEffect(() => {
    setActiveImage(product.images[0]);
    setColor(product.colors[0] || 'Default');
    setSize(product.sizes[0] || 'Standard');
    setQuantity(1);
  }, [product]);

  return (
    <>
      <main className="section section--top">
        <div className="container">
          <Breadcrumb
            items={[
              { label: 'Home', to: '/' },
              { label: 'Products', to: '/products' },
              { label: product.name },
            ]}
          />
          <div className="product-detail">
            <div className="gallery">
              <div className="gallery__main">
                <img src={activeImage} alt={product.name} />
              </div>
              <div className="gallery__thumbs">
                {product.images.map((image) => (
                  <button
                    key={image}
                    className={activeImage === image ? 'is-active' : ''}
                    onClick={() => setActiveImage(image)}
                    aria-label={`Show alternate view for ${product.name}`}
                  >
                    <img src={image} alt={`${product.name} thumbnail`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="product-detail__content">
              <p className="eyebrow">{product.brand}</p>
              <h1>{product.name}</h1>
              <StarRating rating={product.rating} reviews={product.reviews} />
              <div className="price-stack">
                <strong>${product.price.toFixed(2)}</strong>
                <span>${product.originalPrice.toFixed(2)}</span>
                <Badge tone="accent">{product.discount}% OFF</Badge>
              </div>
              <p className="stock-state">
                {product.stock > 0 ? `In stock: ${product.stock} left` : 'Out of stock'}
              </p>
              <p>{product.description}</p>

              <div className="selector-group">
                <h3>Color</h3>
                <div className="swatches">
                  {product.colors.map((item) => (
                    <button
                      key={item}
                      className={color === item ? 'is-active' : ''}
                      onClick={() => setColor(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {product.sizes.length ? (
                <div className="selector-group">
                  <h3>Size</h3>
                  <div className="swatches">
                    {product.sizes.map((item) => (
                      <button
                        key={item}
                        className={size === item ? 'is-active' : ''}
                        onClick={() => setSize(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="detail-actions">
                <div className="quantity-stepper">
                  <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
                    -
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))} aria-label="Increase quantity">
                    +
                  </button>
                </div>
                <button
                  className="button button--primary"
                  onClick={() => addToCart(product, { color, size, quantity })}
                >
                  Add to Cart
                </button>
                <Link className="button button--ghost" to="/checkout" onClick={() => addToCart(product, { color, size, quantity })}>
                  Buy Now
                </Link>
                <button
                  className={`button button--ghost ${isWishlisted ? 'is-active' : ''}`}
                  onClick={() => toggleWishlist(product.id)}
                >
                  {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>
              </div>
            </div>
          </div>

          <section className="tabs">
            <div className="tab-list" role="tablist" aria-label="Product details">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={activeTab === tab ? 'is-active' : ''}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab[0].toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="tab-panel">
              {activeTab === 'description' ? <p>{product.description}</p> : null}
              {activeTab === 'specifications' ? (
                <div className="spec-grid">
                  {Object.entries(product.specs).map(([label, value]) => (
                    <div key={label} className="spec-card">
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              ) : null}
              {activeTab === 'reviews' ? (
                <div className="reviews-layout">
                  <div className="rating-breakdown">
                    {ratingBreakdown.map((item) => (
                      <div key={item.star} className="rating-row">
                        <span>{item.star} star</span>
                        <div className="progress">
                          <span style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="review-list">
                    {productReviews.map((review) => (
                      <article key={review.id} className="review-card">
                        <strong>{review.title}</strong>
                        <StarRating rating={review.rating} />
                        <p>{review.content}</p>
                        <small>
                          {review.author} • {review.date}
                        </small>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="section">
            <div className="section__heading">
              <div>
                <p className="eyebrow">Related products</p>
                <h2>Pairs well with your pick.</h2>
              </div>
            </div>
            <ProductGrid items={relatedProducts} />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function CartPage() {
  const { cart, subtotal, removeFromCart, updateCartQuantity } = useStore();
  const shipping = subtotal > 250 ? 0 : 18;
  const taxes = subtotal * 0.08;
  const total = subtotal + shipping + taxes;

  return (
    <>
      <main className="section section--top">
        <div className="container">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
          <div className="section__heading">
            <div>
              <p className="eyebrow">Shopping cart</p>
              <h1>Review your items before checkout.</h1>
            </div>
          </div>

          {!cart.length ? (
            <div className="empty-state empty-state--large">
              <div className="empty-state__art">🛒</div>
              <h2>Your cart is empty.</h2>
              <p>Discover bestsellers, save favorites, and come back when you're ready.</p>
              <Link className="button button--primary" to="/products">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <section className="cart-items">
                {cart.map((item) => (
                  <article key={item.cartKey} className="cart-line">
                    <img src={item.images[0]} alt={item.name} />
                    <div>
                      <h3>{item.name}</h3>
                      <p>
                        {item.color} / {item.size}
                      </p>
                      <button className="link-button" onClick={() => removeFromCart(item.cartKey)}>
                        Remove
                      </button>
                    </div>
                    <div className="quantity-stepper">
                      <button onClick={() => updateCartQuantity(item.cartKey, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.cartKey, item.quantity + 1)}>+</button>
                    </div>
                    <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                  </article>
                ))}
              </section>

              <aside className="summary-card">
                <h2>Order Summary</h2>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>${subtotal.toFixed(2)}</strong>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <strong>{shipping ? `$${shipping.toFixed(2)}` : 'Free'}</strong>
                </div>
                <div className="summary-row">
                  <span>Taxes</span>
                  <strong>${taxes.toFixed(2)}</strong>
                </div>
                <div className="summary-row summary-row--total">
                  <span>Total</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>
                <div className="promo-code">
                  <input type="text" placeholder="Promo code" aria-label="Promo code" />
                  <button className="button button--ghost">Apply</button>
                </div>
                <div className="summary-actions">
                  <Link className="button button--ghost" to="/products">
                    Continue Shopping
                  </Link>
                  <Link className="button button--primary" to="/checkout">
                    Proceed to Checkout
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function FormField({ label, value, onChange, error, placeholder = '', type = 'text' }) {
  const id = label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error ? <small className="field__error">{error}</small> : null}
    </label>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, subtotal, clearCart, pushToast } = useStore();
  const [step, setStep] = React.useState(1);
  const [paymentMethod, setPaymentMethod] = React.useState('card');
  const [form, setForm] = React.useState({
    address: '',
    cardName: '',
    cardNumber: '',
    city: '',
    cvc: '',
    email: '',
    expiry: '',
    name: '',
    zip: '',
  });
  const [errors, setErrors] = React.useState({});
  const shipping = subtotal > 250 ? 0 : 18;
  const taxes = subtotal * 0.08;
  const total = subtotal + shipping + taxes;

  const validateStep = () => {
    const nextErrors = {};

    if (step === 1) {
      if (!form.name.trim()) nextErrors.name = 'Name is required.';
      if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = 'Enter a valid email.';
      if (!form.address.trim()) nextErrors.address = 'Address is required.';
      if (!form.city.trim()) nextErrors.city = 'City is required.';
      if (!form.zip.trim()) nextErrors.zip = 'ZIP code is required.';
    }

    if (step === 2 && paymentMethod === 'card') {
      if (!form.cardName.trim()) nextErrors.cardName = 'Cardholder name is required.';
      if (form.cardNumber.replace(/\s/g, '').length < 16) nextErrors.cardNumber = 'Enter a valid card number.';
      if (!form.expiry.trim()) nextErrors.expiry = 'Expiry date is required.';
      if (form.cvc.trim().length < 3) nextErrors.cvc = 'Enter a valid CVC.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const advance = () => {
    if (!validateStep()) return;
    setStep((current) => Math.min(3, current + 1));
  };

  const placeOrder = () => {
    pushToast({ type: 'success', message: 'Order placed successfully.' });
    clearCart();
    navigate('/account');
  };

  return (
    <>
      <main className="section section--top">
        <div className="container">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Checkout' }]} />
          <div className="section__heading">
            <div>
              <p className="eyebrow">Checkout</p>
              <h1>Complete your order in three quick steps.</h1>
            </div>
          </div>

          <div className="progress-steps" aria-label="Checkout progress">
            {['Shipping', 'Payment', 'Review'].map((label, index) => (
              <div key={label} className={`progress-step ${step >= index + 1 ? 'is-active' : ''}`}>
                <span>{index + 1}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>

          <div className="checkout-layout">
            <section className="checkout-card">
              {step === 1 ? (
                <div className="form-grid">
                  <FormField label="Full name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} error={errors.name} />
                  <FormField label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} error={errors.email} />
                  <FormField label="Address" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} error={errors.address} />
                  <FormField label="City" value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} error={errors.city} />
                  <FormField label="ZIP code" value={form.zip} onChange={(value) => setForm((current) => ({ ...current, zip: value }))} error={errors.zip} />
                </div>
              ) : null}

              {step === 2 ? (
                <div className="payment-ui">
                  <div className="toggle-row">
                    <button className={paymentMethod === 'card' ? 'is-active' : ''} onClick={() => setPaymentMethod('card')}>
                      Credit Card
                    </button>
                    <button className={paymentMethod === 'paypal' ? 'is-active' : ''} onClick={() => setPaymentMethod('paypal')}>
                      PayPal
                    </button>
                  </div>
                  {paymentMethod === 'card' ? (
                    <div className="form-grid">
                      <FormField label="Cardholder name" value={form.cardName} onChange={(value) => setForm((current) => ({ ...current, cardName: value }))} error={errors.cardName} />
                      <FormField label="Card number" value={form.cardNumber} onChange={(value) => setForm((current) => ({ ...current, cardNumber: value }))} error={errors.cardNumber} placeholder="1234 5678 9012 3456" />
                      <FormField label="Expiry" value={form.expiry} onChange={(value) => setForm((current) => ({ ...current, expiry: value }))} error={errors.expiry} placeholder="MM/YY" />
                      <FormField label="CVC" value={form.cvc} onChange={(value) => setForm((current) => ({ ...current, cvc: value }))} error={errors.cvc} />
                    </div>
                  ) : (
                    <div className="paypal-panel">
                      <p>PayPal checkout will redirect you securely after reviewing your order.</p>
                    </div>
                  )}
                </div>
              ) : null}

              {step === 3 ? (
                <div className="review-block">
                  <h2>Review your order</h2>
                  {cart.map((item) => (
                    <div key={item.cartKey} className="summary-row">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="checkout-actions">
                {step > 1 ? (
                  <button className="button button--ghost" onClick={() => setStep((current) => current - 1)}>
                    Back
                  </button>
                ) : null}
                {step < 3 ? (
                  <button className="button button--primary" onClick={advance}>
                    Continue
                  </button>
                ) : (
                  <button className="button button--primary" onClick={placeOrder}>
                    Place Order
                  </button>
                )}
              </div>
            </section>

            <aside className="summary-card">
              <h2>Order summary</h2>
              <div className="summary-row">
                <span>Items</span>
                <strong>{cart.length}</strong>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <strong>{shipping ? `$${shipping.toFixed(2)}` : 'Free'}</strong>
              </div>
              <div className="summary-row">
                <span>Taxes</span>
                <strong>${taxes.toFixed(2)}</strong>
              </div>
              <div className="summary-row summary-row--total">
                <span>Total</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function AccountPage() {
  const { user, setUser, wishlist, moveWishlistToCart } = useStore();
  const [section, setSection] = React.useState('Profile');
  const wishlistProducts = products.filter((product) => wishlist.includes(product.id));

  return (
    <>
      <main className="section section--top">
        <div className="container">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Account' }]} />
          <div className="account-layout">
            <aside className="account-nav">
              {['Profile', 'Orders', 'Wishlist', 'Addresses', 'Settings'].map((item) => (
                <button key={item} className={section === item ? 'is-active' : ''} onClick={() => setSection(item)}>
                  {item}
                </button>
              ))}
            </aside>

            <section className="account-panel">
              {section === 'Profile' ? (
                <div className="profile-grid">
                  <div className="profile-avatar">
                    <img src={user.avatar} alt={user.fullName} />
                    <label className="button button--ghost">
                      Upload avatar
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => setUser((current) => ({ ...current, avatar: String(reader.result) }));
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                  <div className="form-grid">
                    <FormField label="Full name" value={user.fullName} onChange={(value) => setUser((current) => ({ ...current, fullName: value }))} />
                    <FormField label="Email" value={user.email} onChange={(value) => setUser((current) => ({ ...current, email: value }))} />
                    <FormField label="Phone" value={user.phone} onChange={(value) => setUser((current) => ({ ...current, phone: value }))} />
                  </div>
                </div>
              ) : null}

              {section === 'Orders' ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderHistory.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.date}</td>
                          <td>${order.total.toFixed(2)}</td>
                          <td>
                            <Badge tone={order.status === 'Delivered' ? 'success' : order.status === 'Shipped' ? 'dark' : 'accent'}>
                              {order.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {section === 'Wishlist' ? (
                wishlistProducts.length ? (
                  <div className="wishlist-grid">
                    {wishlistProducts.map((product) => (
                      <div key={product.id} className="wishlist-card">
                        <ProductCard product={product} />
                        <button className="button button--ghost" onClick={() => moveWishlistToCart(product.id)}>
                          Move to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>No saved items yet.</h3>
                    <p>Save products you love and come back when you're ready.</p>
                  </div>
                )
              ) : null}

              {section === 'Addresses' ? (
                <div className="address-list">
                  {user.addresses.map((address) => (
                    <article key={address} className="spec-card">
                      <strong>{address}</strong>
                    </article>
                  ))}
                </div>
              ) : null}

              {section === 'Settings' ? (
                <div className="settings-panel">
                  <label className="checkbox">
                    <input type="checkbox" defaultChecked />
                    <span>Email me about promotions and restocks</span>
                  </label>
                  <label className="checkbox">
                    <input type="checkbox" defaultChecked />
                    <span>Enable order notifications</span>
                  </label>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { setAuthenticated, setUser } = useStore();
  const isRegister = mode === 'register';
  const [form, setForm] = React.useState({
    confirmPassword: '',
    email: '',
    fullName: '',
    password: '',
    remember: false,
    terms: false,
  });
  const [errors, setErrors] = React.useState({});

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (isRegister && !form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = 'Enter a valid email.';
    if (form.password.length < 6) nextErrors.password = 'Use at least 6 characters.';
    if (isRegister && form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords must match.';
    if (isRegister && !form.terms) nextErrors.terms = 'Please accept the terms.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setAuthenticated(true);
    if (isRegister) {
      setUser((current) => ({ ...current, fullName: form.fullName, email: form.email }));
    }
    navigate('/account');
  };

  return (
    <main className="auth-page">
      <div className="auth-card fade-in">
        <p className="eyebrow">{isRegister ? 'Create account' : 'Welcome back'}</p>
        <h1>{isRegister ? 'Register to start shopping smarter.' : 'Sign in to your account.'}</h1>
        <form onSubmit={submit} className="auth-form">
          {isRegister ? (
            <FormField label="Full name" value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} error={errors.fullName} />
          ) : null}
          <FormField label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} error={errors.email} />
          <FormField label="Password" type="password" value={form.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} error={errors.password} />
          {isRegister ? (
            <FormField label="Confirm password" type="password" value={form.confirmPassword} onChange={(value) => setForm((current) => ({ ...current, confirmPassword: value }))} error={errors.confirmPassword} />
          ) : null}

          {!isRegister ? (
            <div className="auth-meta">
              <label className="checkbox">
                <input type="checkbox" checked={form.remember} onChange={(event) => setForm((current) => ({ ...current, remember: event.target.checked }))} />
                <span>Remember me</span>
              </label>
              <Link to="/register">Forgot password?</Link>
            </div>
          ) : (
            <label className="checkbox">
              <input type="checkbox" checked={form.terms} onChange={(event) => setForm((current) => ({ ...current, terms: event.target.checked }))} />
              <span>I agree to the terms and privacy policy.</span>
            </label>
          )}
          {errors.terms ? <small className="field__error">{errors.terms}</small> : null}

          <button className="button button--primary" type="submit">
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="social-login">
          <button className="button button--ghost">Google</button>
          <button className="button button--ghost">Facebook</button>
        </div>

        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Login' : 'Register'}</Link>
        </p>
      </div>
    </main>
  );
}

export function NotFoundPage() {
  return (
    <main className="not-found">
      <div className="not-found__art">404</div>
      <h1>Looks like this page wandered off.</h1>
      <p>The page you are looking for does not exist, or the link has expired.</p>
      <Link className="button button--primary" to="/">
        Go Home
      </Link>
    </main>
  );
}
