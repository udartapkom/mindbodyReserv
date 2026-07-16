'use client';

import { FormEvent, useState } from 'react';
import { authCopy, authSmsDescriptions } from '@/content/authCopy';
import type { SmsPurpose } from '@/components/Auth/types/authFlow';
import styles from '../AuthFlow.module.scss';

type SmsCodeStepProps = {
    phone: string;
    purpose: SmsPurpose;
    onSubmit: (code: string) => void;
    onBackClick: () => void;
};

function SmsCodeStep({ phone, purpose, onSubmit, onBackClick }: SmsCodeStepProps) {
    const [code, setCode] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(code);
    };

    return (
        <>
            <p className={styles.authFlow__description}>{authSmsDescriptions[purpose]}</p>
            <p className={styles.authFlow__phoneHint}>{phone}</p>
            <form className={styles.authFlow__form} onSubmit={handleSubmit}>
                <span className={styles.authFlow__label}>{authCopy.codeLabel}</span>
                <input
                    className={styles.authFlow__input}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder={authCopy.codePlaceholder}
                    value={code}
                    maxLength={6}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                />
                <button type="submit" className={styles.authFlow__button}>
                    {authCopy.smsSubmit}
                </button>
            </form>
            <div className={styles.authFlow__footer}>
                <button type="button" className={styles.authFlow__link} onClick={onBackClick}>
                    {authCopy.back}
                </button>
            </div>
        </>
    );
}

export default SmsCodeStep;
