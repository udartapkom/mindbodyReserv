import { useState, type FormEvent } from 'react';
import { PatternFormat } from 'react-number-format';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getAdminHomePath } from '@/types/user';
import styles from './LoginPage.module.scss';

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return 'Не удалось войти. Проверьте телефон и пароль.';
}

function LoginPage() {
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={getAdminHomePath(user?.role)} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(phone, password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.loginPage}>
      <div className={styles.loginPage__card}>
        <h1 className={styles.loginPage__title}>Вход в админ-панель</h1>
        <p className={styles.loginPage__subtitle}>MindBodyHub Admin</p>

        <form className={styles.loginPage__form} onSubmit={(e) => void handleSubmit(e)} noValidate>
          <label className={styles.loginPage__label} htmlFor="phone">
            Телефон
          </label>
          <PatternFormat
            id="phone"
            className={styles.loginPage__input}
            format="+7 (###) ###-##-##"
            mask="_"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onValueChange={(values) => setPhone(values.formattedValue)}
            required
          />

          <label className={styles.loginPage__label} htmlFor="password">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            className={styles.loginPage__input}
            placeholder="Введите пароль"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error ? <p className={styles.loginPage__error}>{error}</p> : null}

          <button
            type="submit"
            className={styles.loginPage__button}
            disabled={isSubmitting || !phone || !password}
          >
            {isSubmitting ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;
