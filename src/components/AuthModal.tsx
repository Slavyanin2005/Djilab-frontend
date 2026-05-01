import { useState } from 'react';
import { createPortal } from 'react-dom'; // ✅ Импорт Portal
import { AxiosError } from 'axios';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register({ username, email, password });
      }

      onSuccess();
      onClose();
    } catch (err) {
      const axiosErr = err as AxiosError;
      const msg = axiosErr.response?.data;

      if (typeof msg === 'object' && msg !== null) {
        const errors = Object.entries(msg)
          .map(
            ([field, messages]) =>
              `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
          )
          .join('; ');
        setError(errors);
      } else {
        setError((msg as string) || 'Ошибка авторизации');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Используем createPortal, чтобы рендерить окно в body
  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>
          ×
        </button>

        <h2 style={styles.title}>{isLogin ? 'Вход в DJILab' : 'Регистрация'}</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
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
            type="button"
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
    document.body // ✅ Рендерим прямо в body, поверх всего
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
