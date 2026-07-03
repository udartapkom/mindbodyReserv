'use client';

import { FormEvent, useState } from 'react';
import { PatternFormat } from 'react-number-format';
import { authCopy } from '@/content/authCopy';
import styles from '../AuthFlow.module.scss';

type RegisterStepProps = {
    phone: string;
    onPhoneChange: (phone: string) => void;
    onSubmit: (phone: string, password: string) => void;
    onLoginClick: () => void;
    onBackClick: () => void;
};

function RegisterStep({
    phone,
    onPhoneChange,
    onSubmit,
    onLoginClick,
    onBackClick,
}: RegisterStepProps) {
    const [password, setPassword] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(phone, password);
    };

    return (
        <>
            <form className={styles.authFlow__form} onSubmit={handleSubmit}>
                <span className={styles.authFlow__label}>{authCopy.phoneLabel}</span>
                <PatternFormat
                    className={styles.authFlow__input}
                    id="register-telephone"
                    name="telephone"
                    format="+7 (###) ###-##-##"
                    mask="_"
                    placeholder={authCopy.phonePlaceholder}
                    value={phone}
                    onValueChange={(values) => onPhoneChange(values.formattedValue)}
                />
                <span className={styles.authFlow__label}>{authCopy.passwordLabel}</span>
                <input
                    className={styles.authFlow__input}
                    type="password"
                    placeholder={authCopy.passwordPlaceholder}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
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
        </>
    );
}

export default RegisterStep;
