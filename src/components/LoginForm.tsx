import { AxiosError } from 'axios';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      onSuccess?.();
    } catch (err) {
      const axiosErr = err as AxiosError;
      const msg = axiosErr.response?.data;
      setError(
        typeof msg === 'object' && msg !== null
          ? JSON.stringify(msg)
          : (msg as string) || 'Ошибка входа'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.title}>Вход</h3>

      {error && <div style={styles.error}>{error}</div>}

      <input
        type="text"
        placeholder="Имя пользователя"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={styles.input}
        required
        disabled={loading}
      />

      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
        required
        disabled={loading}
      />

      <button type="submit" style={styles.button} disabled={loading}>
        {loading ? 'Вход...' : 'Войти'}
      </button>

      {onSwitchToRegister && (
        <p style={styles.switch}>
          Нет аккаунта?{' '}
          <button type="button" onClick={onSwitchToRegister} style={styles.link}>
            Зарегистрироваться
          </button>
        </p>
      )}
    </form>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '400px',
    margin: '0 auto',
    padding: '32px',
    background: 'var(--bg)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--dark)',
    textAlign: 'center',
  },
  error: {
    padding: '12px',
    background: 'var(--error)',
    color: 'white',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  input: {
    padding: '14px 16px',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: '1rem',
    transition: 'border-color 0.2s ease',
  },
  button: {
    padding: '14px',
    background: 'var(--dji-blue)',
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  switch: {
    margin: '8px 0 0',
    textAlign: 'center',
    color: 'var(--gray)',
    fontSize: '0.95rem',
  },
  link: {
    background: 'none',
    border: 'none',
    color: 'var(--dji-blue)',
    cursor: 'pointer',
    padding: 0,
    font: 'inherit',
    textDecoration: 'none',
  },
};
