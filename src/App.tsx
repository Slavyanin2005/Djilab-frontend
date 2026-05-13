// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Home } from './pages/Home';
import { Cart } from './pages/Cart';
import { Product } from './pages/Product';
import { OrdersHistory } from './pages/OrdersHistory';
import { Login } from './pages/Login';
import { apiService } from './services/api';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const userRef = useRef<User | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const loadUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser) {
      setCartCount(0);
      return;
    }
    try {
      const cartInfo = await apiService.getCartIcon();
      setCartCount(cartInfo.items_count);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!loading) {
      refreshCart();
    }
  }, [user, loading, refreshCart]);

  const handleLogin = async (username: string, password: string) => {
    await apiService.login(username, password);
    await loadUser();
  };

  const handleRegister = async (data: { username: string; email: string; password: string }) => {
    await apiService.register(data);
    await loadUser();
  };

  const handleLogout = async () => {
    await apiService.logout();
    setUser(null);
    setCartCount(0);
  };

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Home получает ВСЕ пропсы (нужны для AuthModal) */}
        <Route
          path="/"
          element={
            <Home
              user={user}
              cartCount={cartCount}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onLogout={handleLogout}
              onCartChange={refreshCart}
            />
          }
        />

        {/* Cart получает ТОЛЬКО нужные пропсы */}
        <Route
          path="/cart"
          element={
            <Cart
              user={user}
              cartCount={cartCount}
              onLogout={handleLogout}
              onCartChange={refreshCart}
            />
          }
        />

        {/* Product получает ТОЛЬКО нужные пропсы */}
        <Route
          path="/product/:id"
          element={
            <Product
              user={user}
              cartCount={cartCount}
              onLogin={handleLogin} // ← Product НУЖЕН onLogin для AuthModal
              onRegister={handleRegister} // ← Product НУЖЕН onRegister для AuthModal
              onLogout={handleLogout}
              onCartChange={refreshCart}
            />
          }
        />

        {/* OrdersHistory получает ТОЛЬКО нужные пропсы */}
        <Route
          path="/orders/history"
          element={
            <OrdersHistory
              user={user}
              cartCount={cartCount}
              onLogout={handleLogout}
              onCartChange={refreshCart}
            />
          }
        />

        {/* Login получает только onLogin/onRegister */}
        <Route
          path="/login"
          element={<Login onLogin={handleLogin} onRegister={handleRegister} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
