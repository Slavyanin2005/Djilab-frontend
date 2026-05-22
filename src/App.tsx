import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';
import {
  checkAuth,
  logout as logoutAction,
  login as loginAction,
  register as registerAction,
} from './store/slices/authSlice';
import { loadCart, clearCart } from './store/slices/cartSlice';
import { clearOrders } from './store/slices/ordersSlice';
import { Home } from './pages/Home';
import { Cart } from './pages/Cart';
import { Product } from './pages/Product';
import { OrdersHistory } from './pages/OrdersHistory';
import { OrderDetail } from './pages/OrderDetail';
import { Profile } from './pages/Profile';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

// ✅ Отдельный компонент для прокрутки — работает ВНУТРИ BrowserRouter
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

// ✅ Основной контент — работает ВНУТРИ BrowserRouter (useNavigate доступен)
function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, isInitialized } = useSelector((state: RootState) => state.auth);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // ✅ Загружаем корзину при появлении пользователя
  useEffect(() => {
    if (isInitialized && user) {
      dispatch(loadCart());
    }
  }, [dispatch, user, isInitialized]);

  const handleAuthRequired = (action?: () => Promise<void>) => {
    if (action) {
      setPendingAction(() => action);
    }
    setShowAuthModal(true);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    if (pendingAction) {
      await pendingAction();
      setPendingAction(null);
    }
    // ✅ НЕ вызываем loadCart() — useEffect выше уже загрузит корзину
  };

  // ✅ ИСПРАВЛЕНО: плавный редирект через navigate
  const handleLogout = async () => {
    await dispatch(logoutAction());
    dispatch(clearCart());
    dispatch(clearOrders());
    dispatch(loadCart()); // Для гостя вернёт {id: null, items_count: 0}
    navigate('/'); // ✅ Плавный переход без перезагрузки
  };

  const handleLogin = async (username: string, password: string) => {
    await dispatch(loginAction({ username, password })).unwrap();
  };

  const handleRegister = async (data: { username: string; email: string; password: string }) => {
    await dispatch(registerAction(data)).unwrap();
  };

  // ✅ ИСПРАВЛЕНО: НЕ блокируем рендер из-за cartLoading
  // Приложение рендерится сразу после инициализации авторизации
  // Корзина грузится в фоне — Header покажет (0) или старое значение, потом обновится
  if (!isInitialized) {
    return (
      <div style={{ padding: '100px', textAlign: 'center', minHeight: '100vh' }}>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />

      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setPendingAction(null);
          }}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* ✅ УБРАЛИ key — Header обновляется через props, а не пересоздаётся */}
      <Header onLogout={handleLogout} onAuthRequired={handleAuthRequired} />

      <Routes>
        <Route path="/" element={<Home onAuthRequired={handleAuthRequired} />} />
        <Route
          path="/cart"
          element={<Cart onAuthRequired={handleAuthRequired} onLogout={handleLogout} />}
        />
        <Route
          path="/product/:id"
          element={<Product onAuthRequired={handleAuthRequired} onLogout={handleLogout} />}
        />
        <Route path="/orders/history" element={<OrdersHistory />} />
        <Route path="/orders/:id" element={<OrderDetail onAuthRequired={handleAuthRequired} />} />
        <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </>
  );
}

// ✅ Главный App — только оборачивает AppContent в BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
