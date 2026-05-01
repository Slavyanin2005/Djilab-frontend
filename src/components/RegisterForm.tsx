import { AxiosError } from 'axios';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(formData);
      onSuccess?.();
    } catch (err) {
      const axiosErr = err as AxiosError;
      const msg = axiosErr.response?.data;
      if (typeof msg === 'object' && msg !== null) {
        // Форматируем ошибки валидации Django
        const errors = Object.entries(msg)
          .map(
            ([field, messages]) =>
              `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
          )
          .join('; ');
        setError(errors);
      } else {
        setError((msg as string) || 'Ошибка регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.title}>Регистрация</h3>

      {error && <div style={styles.error}>{error}</div>}

      <input
        name="username"
        placeholder="Имя пользователя *"
        value={formData.username}
        onChange={handleChange}
        style={styles.input}
        required
        disabled={loading}
      />

      <input
        name="email"
        type="email"
        placeholder="Email *"
        value={formData.email}
        onChange={handleChange}
        style={styles.input}
        required
        disabled={loading}
      />

      <input
        name="password"
        type="password"
        placeholder="Пароль *"
        value={formData.password}
        onChange={handleChange}
        style={styles.input}
        required
        minLength={6}
        disabled={loading}
      />

      <div style={styles.nameRow}>
        <input
          name="first_name"
          placeholder="Имя"
          value={formData.first_name}
          onChange={handleChange}
          style={{ ...styles.input, flex: 1 }}
          disabled={loading}
        />
        <input
          name="last_name"
          placeholder="Фамилия"
          value={formData.last_name}
          onChange={handleChange}
          style={{ ...styles.input, flex: 1, marginLeft: '12px' }}
          disabled={loading}
        />
      </div>

      <button type="submit" style={styles.button} disabled={loading}>
        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
      </button>

      {onSwitchToLogin && (
        <p style={styles.switch}>
          Уже есть аккаунт?{' '}
          <button type="button" onClick={onSwitchToLogin} style={styles.link}>
            Войти
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
  nameRow: {
    display: 'flex',
    gap: '12px',
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
