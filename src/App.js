import React from 'react';
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import './App.css';
import { StoreProvider } from './context/StoreContext';
import { CartDrawer, Navbar, ToastViewport } from './components/UI';
import {
  AccountPage,
  AuthPage,
  CartPage,
  CheckoutPage,
  HomePage,
  NotFoundPage,
  ProductDetailPage,
  ProductsPage,
} from './pages/StorePages';

function ScrollToTop() {
  const location = useLocation();

  React.useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-shell fade-in">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

function StorefrontApp() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <CartDrawer />
      <AnimatedRoutes />
      <ToastViewport />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <StorefrontApp />
      </HashRouter>
    </StoreProvider>
  );
}
