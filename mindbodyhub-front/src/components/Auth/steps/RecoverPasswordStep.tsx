'use client';

import { FormEvent } from 'react';
import { PatternFormat } from 'react-number-format';
import { authCopy } from '@/content/authCopy';
import styles from '../AuthFlow.module.scss';

type RecoverPasswordStepProps = {
    phone: string;
    onPhoneChange: (phone: string) => void;
    onSubmit: (phone: string) => void;
    onBackClick: () => void;
};

function RecoverPasswordStep({
    phone,
    onPhoneChange,
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
                <PatternFormat
                    className={styles.authFlow__input}
                    id="recover-telephone"
                    name="telephone"
                    format="+7 (###) ###-##-##"
                    mask="_"
                    placeholder={authCopy.phonePlaceholder}
                    value={phone}
                    onValueChange={(values) => onPhoneChange(values.formattedValue)}
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
