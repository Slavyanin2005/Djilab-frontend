// src/pages/Profile.tsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchUserProfile, updateProfile, changePassword } from '../store/slices/authSlice';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumbs } from '../components/Breadcrumbs';
import '../index.css';

interface ProfileProps {
  onAuthRequired?: () => void;
  onLogout: () => void; // ✅ Глобальный logout из App.tsx (уже делает редирект)
}

export const Profile: React.FC<ProfileProps> = ({ onAuthRequired, onLogout }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { user, profile, profileLoading } = useSelector((state: RootState) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    company: '',
    position: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загрузка профиля при монтировании
  useEffect(() => {
    if (user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user]);

  // Заполнение формы данными профиля
  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || '',
        company: profile.company || '',
        position: profile.position || '',
      });
    }
  }, [profile]);

  // Если пользователь не авторизован — редирект на вход
  if (!user) {
    onAuthRequired?.();
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
    } catch (error: any) {
      alert('Ошибка при сохранении: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsSubmitting(true);

    // Валидация
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Пароль должен содержать не менее 8 символов');
      setIsSubmitting(false);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Пароли не совпадают');
      setIsSubmitting(false);
      return;
    }

    try {
      await dispatch(
        changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      ).unwrap();
      setPasswordSuccess('✅ Пароль успешно изменён');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordError(error.message || 'Ошибка при смене пароля');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading && !profile) {
    return (
      <div>
        <Header onLogout={onLogout} onAuthRequired={onAuthRequired} />
        <div className="container" style={{ padding: '120px', textAlign: 'center' }}>
          Загрузка профиля...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header onLogout={onLogout} onAuthRequired={onAuthRequired} />

      <div className="container" style={{ paddingTop: '20px' }}>
        <Breadcrumbs />
      </div>

      <main className="container" style={{ padding: '40px 0 100px' }}>
        <div className="cart-page">
          <h1 className="section-title">Личный кабинет</h1>

          <div
            style={{
              maxWidth: '700px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
            }}
          >
            {/* Карточка: Информация о пользователе */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>👤 Информация о пользователе</h2>
              <div style={styles.infoGrid}>
                <div>
                  <label style={styles.label}>Имя пользователя</label>
                  <p style={styles.value}>{user.username}</p>
                </div>
                <div>
                  <label style={styles.label}>Email</label>
                  <p style={styles.value}>{user.email || 'Не указан'}</p>
                </div>
                <div>
                  <label style={styles.label}>Роль</label>
                  <p style={styles.value}>
                    {user.is_staff ? <span style={styles.badge}>Модератор</span> : 'Пользователь'}
                  </p>
                </div>
              </div>
            </section>

            {/* Карточка: Контактные данные */}
            <section style={styles.section}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>📋 Контактные данные</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary"
                    style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                  >
                    ✏️ Редактировать
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} style={styles.form}>
                  <div style={styles.formGrid}>
                    <div>
                      <label style={styles.label}>Телефон</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="+7 (___) ___-__-__"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Компания</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="Название организации"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Должность</label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="Ваша должность"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: '12px 32px' }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Сохранение...' : '💾 Сохранить'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        if (profile) {
                          setFormData({
                            phone: profile.phone || '',
                            company: profile.company || '',
                            position: profile.position || '',
                          });
                        }
                      }}
                      className="btn-secondary"
                      style={{ padding: '12px 32px' }}
                      disabled={isSubmitting}
                    >
                      ✕ Отмена
                    </button>
                  </div>
                </form>
              ) : (
                <div style={styles.infoGrid}>
                  <div>
                    <label style={styles.label}>Телефон</label>
                    <p style={styles.value}>{profile?.phone || 'Не указан'}</p>
                  </div>
                  <div>
                    <label style={styles.label}>Компания</label>
                    <p style={styles.value}>{profile?.company || 'Не указана'}</p>
                  </div>
                  <div>
                    <label style={styles.label}>Должность</label>
                    <p style={styles.value}>{profile?.position || 'Не указана'}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Карточка: Смена пароля */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>🔐 Смена пароля</h2>
              <form onSubmit={handleChangePassword} style={styles.form}>
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>Текущий пароль</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      style={styles.input}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Новый пароль</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      style={styles.input}
                      required
                      minLength={8}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Подтвердите пароль</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      style={styles.input}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {passwordError && <div style={styles.error}>{passwordError}</div>}
                {passwordSuccess && <div style={styles.success}>{passwordSuccess}</div>}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '12px 32px', marginTop: '16px', width: 'fit-content' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Изменение...' : '🔄 Изменить пароль'}
                </button>
              </form>
            </section>

            {/* Карточка: Выход */}
            <section style={{ ...styles.section, textAlign: 'center' }}>
              <button
                // ✅ ИСПРАВЛЕНО: только onLogout — он уже делает редирект через window.location.href
                onClick={onLogout}
                className="btn-secondary"
                style={{
                  padding: '14px 48px',
                  fontSize: '1rem',
                  background: 'var(--error)',
                  color: 'white',
                  border: 'none',
                }}
              >
                🚪 Выйти из аккаунта
              </button>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Стили в том же стиле, что и у сайта
const styles: Record<string, React.CSSProperties> = {
  section: {
    background: 'var(--bg-alt)',
    padding: '28px',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
  },
  sectionTitle: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: 'var(--dark)',
    marginBottom: '20px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    color: 'var(--gray)',
    marginBottom: '6px',
    fontWeight: 500,
  },
  value: {
    fontSize: '1.05rem',
    color: 'var(--dark)',
    fontWeight: 500,
    margin: 0,
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    background: 'var(--dji-blue)',
    color: 'white',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: '1rem',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  error: {
    background: 'var(--error)',
    color: 'white',
    padding: '12px 16px',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    marginTop: '8px',
  },
  success: {
    background: 'var(--success)',
    color: 'white',
    padding: '12px 16px',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    marginTop: '8px',
  },
};
