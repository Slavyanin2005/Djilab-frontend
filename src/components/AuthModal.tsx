import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { clearRegistrationSuccess } from '../store/slices/authSlice';

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
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const registrationSuccess = useSelector((state: RootState) => state.auth.registrationSuccess);

  useEffect(() => {
    if (registrationSuccess && !isLogin) {
      setIsLogin(true);
      setError('✅ Регистрация успешна! Теперь войдите в систему.');
      dispatch(clearRegistrationSuccess());
    }
  }, [registrationSuccess, isLogin, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
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
        return;
      }
      onSuccess();
    } catch (err: any) {
      console.log('🔍 Auth error FULL:', {
        err,
        type: typeof err,
        payload: err?.payload,
        response: err?.response,
        responseData: err?.response?.data,
        message: err?.message,
        error: err?.error,
      });

      let message = 'Произошла ошибка. Попробуйте ещё раз.';

      if (typeof err === 'string') {
        message = err;
      } else if (err?.payload && typeof err.payload === 'string') {
        message = err.payload;
      } else if (
        err &&
        typeof err === 'object' &&
        !err.response &&
        !err.message &&
        Object.keys(err).length > 0 &&
        Object.values(err).every((val) => Array.isArray(val) || typeof val === 'string')
      ) {
        const data = err;
        if (data?.non_field_errors && Array.isArray(data.non_field_errors)) {
          message = data.non_field_errors.join(' ');
        } else if (data?.detail) {
          message = data.detail;
        } else if (data?.error) {
          message = data.error;
        } else {
          const fieldErrors = Object.entries(data)
            .filter(([_, val]) => Array.isArray(val) && val.length > 0)
            .map(([field, msgs]) => {
              const messages = Array.isArray(msgs) ? msgs : [msgs];
              const fieldName =
                field === 'password'
                  ? 'Пароль'
                  : field === 'username'
                    ? 'Имя пользователя'
                    : field === 'email'
                      ? 'Email'
                      : field;
              return `${fieldName}: ${messages.join(', ')}`;
            })
            .join('; ');
          message = fieldErrors || 'Ошибка валидации данных';
        }
      } else if (err?.response?.data !== undefined && err?.response?.data !== null) {
        const data = err.response.data;
        if (typeof data === 'string') {
          message = data;
        } else if (typeof data === 'object') {
          if (data?.non_field_errors && Array.isArray(data.non_field_errors)) {
            message = data.non_field_errors.join(' ');
          } else if (data?.detail) {
            message = data.detail;
          } else if (data?.error) {
            message = data.error;
          } else {
            const fieldErrors = Object.entries(data)
              .filter(([_, val]) => Array.isArray(val) && val.length > 0)
              .map(([field, msgs]) => {
                const messages = Array.isArray(msgs) ? msgs : [msgs];
                const fieldName =
                  field === 'password'
                    ? 'Пароль'
                    : field === 'username'
                      ? 'Имя пользователя'
                      : field === 'email'
                        ? 'Email'
                        : field;
                return `${fieldName}: ${messages.join(', ')}`;
              })
              .join('; ');
            message = fieldErrors || 'Ошибка валидации данных';
          }
        }
      } else if (err?.message && typeof err.message === 'string' && err.message) {
        message = err.message;
      } else if (err?.error && typeof err.error === 'string') {
        message = err.error;
      }

      if (!message || message.trim() === '') {
        message = 'Произошла ошибка. Проверьте данные и попробуйте ещё раз.';
      }

      console.log('❌ Showing error to user:', message);
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }

    return false;
  };

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose} type="button">
          ×
        </button>
        <h2 style={styles.title}>{isLogin ? 'Вход в систему' : 'Регистрация'}</h2>

        {error && <div style={styles.error}>{error}</div>}

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
