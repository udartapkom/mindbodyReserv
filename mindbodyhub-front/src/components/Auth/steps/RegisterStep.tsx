'use client';

import { useState } from 'react';
import { authCopy } from '@/content/authCopy';
import { Toast } from '@/shared/ui/Toast';
import { PasswordInput } from '@/shared/ui/PasswordInput';
import { PhoneField } from '@/shared/ui/PhoneField';
import { isPasswordStrong, PASSWORD_POLICY_MESSAGE } from '@/utils/password';
import type { PhoneCountryId } from '@/utils/phone';
import styles from '../AuthFlow.module.scss';
import Popup from '@/components/Popup/Popup';
import ErrorPopup from '@/components/ErrorPopup/ErrorPopup';

type RegisterStepProps = {
    phone: string;
    phoneCountry: PhoneCountryId;
    onPhoneChange: (phone: string) => void;
    onPhoneCountryChange: (country: PhoneCountryId) => void;
    onSubmit: (
        phone: string,
        password: string,
        phoneCountry: PhoneCountryId,
    ) => void | Promise<void>;
    onLoginClick: () => void;
    onBackClick: () => void;
};

function RegisterStep({
    phone,
    phoneCountry,
    onPhoneChange,
    onPhoneCountryChange,
    onSubmit,
    onLoginClick,
    onBackClick,
}: RegisterStepProps) {
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [showPasswordPolicyError, setShowPasswordPolicyError] = useState(false);
    const [showPasswordMismatchError, setShowPasswordMismatchError] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const isPasswordPolicyValid = isPasswordStrong(password);
    const isPasswordMatch = password === passwordConfirm;
    const hasPasswordPolicyError = showPasswordPolicyError && !isPasswordPolicyValid;
    const hasPasswordMismatch = showPasswordMismatchError && !isPasswordMatch;

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!isPasswordPolicyValid) {
            setShowPasswordPolicyError(true);
            setShowPasswordMismatchError(false);
            setIsPopupOpen(true);
            return;
        }

        if (!isPasswordMatch) {
            setShowPasswordMismatchError(true);
            setShowPasswordPolicyError(false);
            setIsPopupOpen(true);
            return;
        }

        setShowPasswordPolicyError(false);
        setShowPasswordMismatchError(false);
        await onSubmit(phone, password, phoneCountry);
    };
    const handlePopupClose = () => {
        setIsPopupOpen(false);
      };
    
      const handlePopupSubmit = () => {
        setIsPopupOpen(false);
      };

    return (
        <>
            <form
                className={styles.authFlow__form}
                onSubmit={handleSubmit}
            >
                <span className={styles.authFlow__label}>{authCopy.phoneLabel}</span>
                <PhoneField
                    id="register-telephone"
                    name="telephone"
                    className={styles.authFlow__phoneField}
                    value={phone}
                    country={phoneCountry}
                    onChange={onPhoneChange}
                    onCountryChange={onPhoneCountryChange}
                />

                <div className={styles.authFlow__field}>
                    <span
                        className={[
                            styles.authFlow__label,
                            hasPasswordPolicyError ? styles.authFlow__label_error : '',
                        ].join(' ')}
                    >
                        {authCopy.passwordLabel}
                    </span>

                    <Toast
                        isVisible={isPasswordFocused}
                        message={PASSWORD_POLICY_MESSAGE}
                        variant={hasPasswordPolicyError ? 'error' : 'info'}
                    />

                    <PasswordInput
                        className={[
                            styles.authFlow__input,
                            hasPasswordPolicyError || hasPasswordMismatch
                                ? styles.authFlow__input_error
                                : '',
                        ].join(' ')}
                        wrapperClassName={styles.authFlow__passwordField}
                        placeholder={authCopy.passwordPlaceholder}
                        value={password}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            setShowPasswordPolicyError(false);
                            setShowPasswordMismatchError(false);
                        }}
                        autoComplete="new-password"
                    />
                </div>

                <span
                    className={[
                        styles.authFlow__label,
                        hasPasswordMismatch ? styles.authFlow__label_error : '',
                    ].join(' ')}
                >
                    {authCopy.passwordConfirmLabel}
                </span>
                <PasswordInput
                    className={[
                        styles.authFlow__input,
                        hasPasswordMismatch ? styles.authFlow__input_error : '',
                    ].join(' ')}
                    wrapperClassName={styles.authFlow__passwordField}
                    placeholder={authCopy.passwordConfirmPlaceholder}
                    value={passwordConfirm}
                    onChange={(event) => {
                        setPasswordConfirm(event.target.value);
                        setShowPasswordMismatchError(false);
                    }}
                    autoComplete="new-password"
                />
                <button type="submit" className={styles.authFlow__button}>
                    {authCopy.registerSubmit}
                </button>
            </form>
            <div className={styles.authFlow__footer}>
                <button type="button" className={styles.authFlow__link} onClick={onLoginClick}>
                    {authCopy.hasAccount}
                </button>
                <button type="button" className={styles.authFlow__link} onClick={onBackClick}>
                    {authCopy.back}
                </button>
            </div>
            <Popup title="Ошибка" isOpen={isPopupOpen} onClose={handlePopupClose}>
                <ErrorPopup
                    title="Ошибка"
                    description="Пароли не совпадают или не соответствуют требованиям безопасности"
                    icon="times-circle-o"
                    variant="regular"
                    submit={handlePopupSubmit}
                />
            </Popup>
        </>
    );
}

export default RegisterStep;
