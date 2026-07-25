'use client';

import { useState } from 'react';
import { authCopy } from '@/content/authCopy';
import { PasswordInput } from '@/shared/ui/PasswordInput';
import { PhoneField } from '@/shared/ui/PhoneField';
import type { PhoneCountryId } from '@/utils/phone';
import styles from '../AuthFlow.module.scss';

type LoginStepProps = {
    phone: string;
    phoneCountry: PhoneCountryId;
    onPhoneChange: (phone: string) => void;
    onPhoneCountryChange: (country: PhoneCountryId) => void;
    onSubmit: (phone: string, password: string) => void;
    onRegisterClick: () => void;
    onRecoverClick: () => void;
};

function LoginStep({
    phone,
    phoneCountry,
    onPhoneChange,
    onPhoneCountryChange,
    onSubmit,
    onRegisterClick,
    onRecoverClick,
}: LoginStepProps) {
    const [password, setPassword] = useState('');
    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(phone, password);
    };

    return (
        <>
            <form className={styles.authFlow__form} onSubmit={handleSubmit}>
                <span className={styles.authFlow__label}>{authCopy.phoneLabel}</span>
                <PhoneField
                    id="login-telephone"
                    name="telephone"
                    className={styles.authFlow__phoneField}
                    value={phone}
                    country={phoneCountry}
                    onChange={onPhoneChange}
                    onCountryChange={onPhoneCountryChange}
                />
                <span className={styles.authFlow__label}>{authCopy.passwordLabel}</span>
                <PasswordInput
                    className={styles.authFlow__input}
                    wrapperClassName={styles.authFlow__passwordField}
                    placeholder={authCopy.passwordPlaceholder}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                />
                <button type="submit" className={styles.authFlow__button}>
                    {authCopy.loginSubmit}
                </button>
            </form>
            <div className={styles.authFlow__footer}>
                <button type="button" className={styles.authFlow__link} onClick={onRegisterClick}>
                    {authCopy.noAccount}
                </button>
                <button type="button" className={styles.authFlow__link} onClick={onRecoverClick}>
                    {authCopy.forgotPassword}
                </button>
            </div>
        </>
    );
}

export default LoginStep;
