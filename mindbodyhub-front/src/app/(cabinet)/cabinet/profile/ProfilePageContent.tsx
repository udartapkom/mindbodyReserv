'use client';

import { FormEvent, useEffect, useState } from 'react';
import AvatarField from '@/components/Cabinet/AvatarField/AvatarField';
import Popup from '@/components/Popup/Popup';
import ErrorPopup from '@/components/ErrorPopup/ErrorPopup';
import { useAuth } from '@/context/AuthContext';
import { isPasswordStrong, PASSWORD_POLICY_MESSAGE } from '@/utils/password';
import styles from './page.module.scss';

function ProfilePageContent() {
  const { user, updateProfile, changePassword } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
  }, [user]);

  const showError = (message: string) => {
    setErrorMessage(message);
    setIsErrorOpen(true);
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsProfileSaving(true);
    setSuccessMessage(null);

    try {
      await updateProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      setSuccessMessage('Профиль сохранён');
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Не удалось сохранить профиль';
      showError(message);
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      showError('Новый пароль и подтверждение не совпадают');
      return;
    }

    if (!isPasswordStrong(newPassword)) {
      showError(PASSWORD_POLICY_MESSAGE);
      return;
    }

    setIsPasswordSaving(true);
    setSuccessMessage(null);

    try {
      await changePassword({
        currentPassword: oldPassword,
        newPassword,
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Пароль изменён');
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Не удалось изменить пароль';
      showError(message);
    } finally {
      setIsPasswordSaving(false);
    }
  };

  return (
    <section>
      <h1>Настройки профиля</h1>
      <p>Здесь вы можете изменить свои данные и настройки аккаунта.</p>

      {successMessage ? <p className={styles.profile__success}>{successMessage}</p> : null}

      <form className={styles.profile__form} onSubmit={(event) => void handleProfileSubmit(event)}>
        <div className={styles.profile__formGroup}>
          <label htmlFor="firstName" className={styles.profile__formGroupLabel}>
            Имя
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className={styles.profile__formGroupInput}
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </div>

        <div className={styles.profile__formGroup}>
          <label htmlFor="lastName" className={styles.profile__formGroupLabel}>
            Фамилия
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className={styles.profile__formGroupInput}
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>

        <AvatarField onError={showError} />

        <div className={styles.profile__formGroup}>
          <label htmlFor="phone" className={styles.profile__formGroupLabel}>
            Телефон
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className={`${styles.profile__formGroupInput} ${styles.profile__formGroupInput_readonly}`}
            value={user?.phone ?? ''}
            readOnly
          />
        </div>

        <button type="submit" className={styles.profile__submit} disabled={isProfileSaving}>
          {isProfileSaving ? 'Сохранение…' : 'Сохранить профиль'}
        </button>
      </form>

      <h3>Изменить пароль</h3>
      <form className={styles.profile__form} onSubmit={(event) => void handlePasswordSubmit(event)}>
        <div className={styles.profile__formGroup}>
          <label htmlFor="oldPassword" className={styles.profile__formGroupLabel}>
            Старый пароль
          </label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            className={styles.profile__formGroupInput}
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className={styles.profile__formGroup}>
          <label htmlFor="password" className={styles.profile__formGroupLabel}>
            Новый пароль
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className={styles.profile__formGroupInput}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className={styles.profile__formGroup}>
          <label htmlFor="confirmPassword" className={styles.profile__formGroupLabel}>
            Подтвердите пароль
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className={styles.profile__formGroupInput}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className={styles.profile__submit} disabled={isPasswordSaving}>
          {isPasswordSaving ? 'Сохранение…' : 'Изменить пароль'}
        </button>
      </form>

      <Popup title="Ошибка" isOpen={isErrorOpen} onClose={() => setIsErrorOpen(false)}>
        <ErrorPopup
          title="Ошибка"
          description={errorMessage ?? 'Произошла ошибка'}
          icon="times-circle-o"
          variant="regular"
          submit={() => setIsErrorOpen(false)}
        />
      </Popup>
    </section>
  );
}

export default ProfilePageContent;
