import { useState } from 'react';
import { createPortal } from 'react-dom';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onLogin?: (username: string, password: string) => Promise<void>;
  onRegister?: (data: { username: string; email: string; password: string }) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onSuccess,
  onLogin,
  onRegister,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    // ✅ ЖЁСТКАЯ ЗАЩИТА от перезагрузки
    e.preventDefault();
    e.stopPropagation();

    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        if (onLogin) {
          await onLogin(username, password);
        }
      } else {
        if (onRegister) {
          await onRegister({ username, email, password });
        }
      }
      // ✅ Только при успехе закрываем модалку
      onSuccess();
    } catch (err: any) {
      console.log('🔍 Auth error:', err, 'type:', typeof err);

      // ✅ Извлекаем сообщение (строка от .unwrap())
      let message = 'Ошибка авторизации';

      if (typeof err === 'string') {
        message = err; // ← Наш случай!
      } else if (err?.payload && typeof err.payload === 'string') {
        message = err.payload;
      } else if (err?.response?.data?.error) {
        message = err.response.data.error;
      } else if (err?.message) {
        message = err.message;
      } else if (err?.error && typeof err.error === 'string') {
        message = err.error;
      }

      setError(message);
      // ✅ Критично: прерываем выполнение, не вызываем onSuccess()
      return false;
    } finally {
      setLoading(false);
    }

    // ✅ Явно возвращаем false, чтобы браузер не сабмитил форму
    return false;
  };

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose} type="button">
          ×
        </button>
        <h2 style={styles.title}>{isLogin ? 'Вход в систему' : 'Регистрация'}</h2>

        {/* ✅ Красное окошко с ошибкой */}
        {error && <div style={styles.error}>{error}</div>}

        {/* ✅ noValidate отключает встроенную валидацию браузера */}
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
            disabled={loading}
          />
          {!isLogin && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              disabled={loading}
            />
          )}
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            disabled={loading}
          />
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
        <p style={styles.switchText}>
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          <button
            type="button" // ✅ Критично: не сабмитит форму
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            style={styles.switchBtn}
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </div>
    </div>,
    document.body
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'var(--bg)',
    padding: '40px',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '400px',
    position: 'relative',
    boxShadow: 'var(--shadow)',
    margin: '20px',
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: 'var(--gray)',
  },
  title: {
    marginBottom: '24px',
    textAlign: 'center',
    color: 'var(--dark)',
  },
  error: {
    background: 'var(--error)',
    color: 'white',
    padding: '12px',
    borderRadius: 'var(--radius)',
    marginBottom: '16px',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  input: {
    padding: '14px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: '1rem',
  },
  submitBtn: {
    padding: '14px',
    background: 'var(--dji-blue)',
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  switchText: {
    marginTop: '20px',
    textAlign: 'center',
    color: 'var(--gray)',
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--dji-blue)',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: '6px',
  },
};
