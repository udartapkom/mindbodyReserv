'use client';

import { FormEvent } from 'react';
import { authCopy } from '@/content/authCopy';
import { PhoneField } from '@/shared/ui/PhoneField';
import type { PhoneCountryId } from '@/utils/phone';
import styles from '../AuthFlow.module.scss';

type RecoverPasswordStepProps = {
    phone: string;
    phoneCountry: PhoneCountryId;
    onPhoneChange: (phone: string) => void;
    onPhoneCountryChange: (country: PhoneCountryId) => void;
    onSubmit: (phone: string) => void;
    onBackClick: () => void;
};

function RecoverPasswordStep({
    phone,
    phoneCountry,
    onPhoneChange,
    onPhoneCountryChange,
    onSubmit,
    onBackClick,
}: RecoverPasswordStepProps) {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(phone);
    };

    return (
        <>
            <form className={styles.authFlow__form} onSubmit={handleSubmit}>
                <span className={styles.authFlow__label}>{authCopy.phoneLabel}</span>
                <PhoneField
                    id="recover-telephone"
                    name="telephone"
                    className={styles.authFlow__phoneField}
                    value={phone}
                    country={phoneCountry}
                    onChange={onPhoneChange}
                    onCountryChange={onPhoneCountryChange}
                />
                <button type="submit" className={styles.authFlow__button}>
                    {authCopy.recoverSubmit}
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

export default RecoverPasswordStep;
