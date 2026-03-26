import React from 'react';
import { defaultUser, products } from '../data/storeData';

const StoreContext = React.createContext(null);

const STORAGE_KEYS = {
  auth: 'storefront_auth',
  cart: 'storefront_cart',
  theme: 'storefront_theme',
  user: 'storefront_user',
  wishlist: 'storefront_wishlist',
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(
        (item) =>
          item.id === action.payload.id &&
          item.color === action.payload.color &&
          item.size === action.payload.size
      );

      if (existing) {
        return state.map((item) =>
          item === existing
            ? { ...item, quantity: Math.min(item.quantity + action.payload.quantity, item.stock) }
            : item
        );
      }

      return [...state, action.payload];
    }
    case 'REMOVE_ITEM':
      return state.filter((item) => item.cartKey !== action.payload);
    case 'UPDATE_QUANTITY':
      return state.map((item) =>
        item.cartKey === action.payload.cartKey
          ? {
              ...item,
              quantity: Math.max(1, Math.min(action.payload.quantity, item.stock)),
            }
          : item
      );
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [cart, dispatch] = React.useReducer(
    cartReducer,
    [],
    () => (typeof window === 'undefined' ? [] : readStorage(STORAGE_KEYS.cart, []))
  );
  const [wishlist, setWishlist] = React.useState(() =>
    typeof window === 'undefined' ? [] : readStorage(STORAGE_KEYS.wishlist, [])
  );
  const [theme, setTheme] = React.useState(() =>
    typeof window === 'undefined' ? 'light' : readStorage(STORAGE_KEYS.theme, 'light')
  );
  const [isCartOpen, setCartOpen] = React.useState(false);
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const [toasts, setToasts] = React.useState([]);
  const [isAuthenticated, setAuthenticated] = React.useState(() =>
    typeof window === 'undefined' ? false : readStorage(STORAGE_KEYS.auth, false)
  );
  const [user, setUser] = React.useState(() =>
    typeof window === 'undefined' ? defaultUser : readStorage(STORAGE_KEYS.user, defaultUser)
  );

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  }, [cart]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlist));
  }, [wishlist]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme));
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  }, [user]);

  const pushToast = React.useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, ...toast }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 2600);
  }, []);

  const addToCart = React.useCallback(
    (product, options = {}) => {
      const color = options.color || product.colors?.[0] || 'Default';
      const size = options.size || product.sizes?.[0] || 'Standard';
      const quantity = options.quantity || 1;
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          ...product,
          color,
          size,
          quantity,
          cartKey: `${product.id}-${color}-${size}`,
        },
      });
      setCartOpen(true);
      pushToast({ type: 'success', message: `${product.name} added to cart.` });
    },
    [pushToast]
  );

  const toggleWishlist = React.useCallback(
    (productId) => {
      setWishlist((current) => {
        const exists = current.includes(productId);
        pushToast({
          type: exists ? 'info' : 'success',
          message: exists ? 'Removed from wishlist.' : 'Saved to wishlist.',
        });
        return exists ? current.filter((id) => id !== productId) : [...current, productId];
      });
    },
    [pushToast]
  );

  const moveWishlistToCart = React.useCallback(
    (productId) => {
      const product = products.find((item) => item.id === productId);
      if (!product) {
        return;
      }
      addToCart(product);
      setWishlist((current) => current.filter((id) => id !== productId));
    },
    [addToCart]
  );

  const value = React.useMemo(
    () => ({
      addToCart,
      cart,
      cartCount: cart.reduce((total, item) => total + item.quantity, 0),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      isAuthenticated,
      isCartOpen,
      isMenuOpen,
      moveWishlistToCart,
      products,
      pushToast,
      removeFromCart: (cartKey) => dispatch({ type: 'REMOVE_ITEM', payload: cartKey }),
      setAuthenticated,
      setCartOpen,
      setMenuOpen,
      setTheme,
      setUser,
      subtotal: cart.reduce((total, item) => total + item.quantity * item.price, 0),
      theme,
      toasts,
      toggleWishlist,
      updateCartQuantity: (cartKey, quantity) =>
        dispatch({ type: 'UPDATE_QUANTITY', payload: { cartKey, quantity } }),
      user,
      wishlist,
    }),
    [
      addToCart,
      cart,
      isAuthenticated,
      isCartOpen,
      isMenuOpen,
      moveWishlistToCart,
      pushToast,
      theme,
      toasts,
      toggleWishlist,
      user,
      wishlist,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return context;
}
