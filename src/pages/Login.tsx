// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (data: { username: string; email: string; password: string }) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await onLogin(formData.username, formData.password);
      } else {
        await onRegister({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
      }
      navigate('/');
      window.location.reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка';
      setError(message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isLogin ? 'Вход' : 'Регистрация'}</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Имя пользователя"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            style={styles.input}
            required
          />

          {!isLogin && (
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={styles.input}
              required
            />
          )}

          <input
            type="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button}>
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <p style={styles.switch}>
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={styles.link}
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>

        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← На главную
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '72px',
    background: 'var(--bg-alt)',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '24px',
    color: 'var(--dark)',
  },
  error: {
    background: 'var(--error)',
    color: 'white',
    padding: '12px',
    borderRadius: 'var(--radius)',
    marginBottom: '16px',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '14px',
    marginBottom: '16px',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'var(--dji-blue)',
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  switch: {
    textAlign: 'center',
    color: 'var(--gray)',
  },
  link: {
    background: 'none',
    border: 'none',
    color: 'var(--dji-blue)',
    cursor: 'pointer',
    marginLeft: '4px',
    fontWeight: '600',
  },
  backButton: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    border: '2px solid var(--border)',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
};
