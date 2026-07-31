'use client';

import { FormEvent, useEffect, useState } from 'react';
import AvatarField from '@/components/Cabinet/AvatarField/AvatarField';
import Popup from '@/components/Popup/Popup';
import ErrorPopup from '@/components/ErrorPopup/ErrorPopup';
import PwaInstallCard from '@/components/Pwa/PwaInstallCard/PwaInstallCard';
import PwaPushCard from '@/components/Pwa/PwaPushCard/PwaPushCard';
import { useAuth } from '@/context/AuthContext';
import type { IconName } from '@/shared/ui/Icon';
import { PasswordInput } from '@/shared/ui/PasswordInput';
import { isPasswordStrong, PASSWORD_POLICY_MESSAGE } from '@/utils/password';
import { getPhoneCountryLabel } from '@/utils/user';
import styles from './page.module.scss';

const PHONE_CHANGE_MESSAGE = 'Обратитесь в техподдержку для смены номера телефона';

type ProfilePopup = {
  title: string;
  description: string;
  icon: IconName;
};

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
  const [popup, setPopup] = useState<ProfilePopup | null>(null);

  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
  }, [user]);

  const closePopup = () => setPopup(null);

  const showError = (message: string) => {
    setPopup({
      title: 'Ошибка',
      description: message,
      icon: 'times-circle-o',
    });
  };

  const showPhoneChangeInfo = () => {
    setPopup({
      title: 'Смена телефона',
      description: PHONE_CHANGE_MESSAGE,
      icon: 'info-circle',
    });
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
    <section className={styles.profile}>
      <header className={styles.profile__header}>
        <h1 className={styles.profile__title}>Настройки профиля</h1>
        <p className={styles.profile__subtitle}>
          Здесь вы можете изменить свои данные и настройки аккаунта.
        </p>
      </header>

      {successMessage ? <p className={styles.profile__success}>{successMessage}</p> : null}

      <form className={styles.profile__card} onSubmit={(event) => void handleProfileSubmit(event)}>
        <h2 className={styles.profile__cardTitle}>Основные данные</h2>
        <p className={styles.profile__cardHint}>Имя, фамилия и аватар для вашего аккаунта</p>

        <div className={styles.profile__fields}>
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
              onClick={showPhoneChangeInfo}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  showPhoneChangeInfo();
                }
              }}
              aria-describedby="phone-change-hint"
            />
            <span id="phone-change-hint" className={styles.profile__fieldHint}>
              Нажмите, чтобы узнать, как сменить номер
            </span>
          </div>

          <div className={styles.profile__formGroup}>
            <label htmlFor="phoneCountry" className={styles.profile__formGroupLabel}>
              Страна номера
            </label>
            <input
              type="text"
              id="phoneCountry"
              name="phoneCountry"
              className={`${styles.profile__formGroupInput} ${styles.profile__formGroupInput_readonly}`}
              value={getPhoneCountryLabel(user?.phoneCountry)}
              readOnly
            />
          </div>
        </div>

        <button type="submit" className={styles.profile__submit} disabled={isProfileSaving}>
          {isProfileSaving ? 'Сохранение…' : 'Сохранить профиль'}
        </button>
      </form>

      <form className={styles.profile__card} onSubmit={(event) => void handlePasswordSubmit(event)}>
        <h2 className={styles.profile__cardTitle}>Изменить пароль</h2>
        <p className={styles.profile__cardHint}>Для смены пароля укажите текущий и новый пароль</p>

        <div className={styles.profile__fields}>
          <div className={styles.profile__formGroup}>
            <label htmlFor="oldPassword" className={styles.profile__formGroupLabel}>
              Старый пароль
            </label>
            <PasswordInput
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
            <PasswordInput
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
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              className={styles.profile__formGroupInput}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button type="submit" className={styles.profile__submit} disabled={isPasswordSaving}>
          {isPasswordSaving ? 'Сохранение…' : 'Изменить пароль'}
        </button>
      </form>

      <PwaInstallCard />
      <PwaPushCard />

      <Popup
        title={popup?.title ?? 'Уведомление'}
        isOpen={popup !== null}
        onClose={closePopup}
      >
        <ErrorPopup
          title={popup?.title ?? 'Уведомление'}
          description={popup?.description ?? ''}
          icon={popup?.icon ?? 'info-circle'}
          variant="regular"
          submit={closePopup}
        />
      </Popup>
    </section>
  );
}

export default ProfilePageContent;
