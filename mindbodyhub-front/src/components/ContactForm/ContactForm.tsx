'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PatternFormat } from 'react-number-format';
import styles from './ContactForm.module.scss';
import {
    getVisibleValidationErrors,
    isFormValid,
    validateBookingForm,
    type ValidationErrors,
} from '@/utils/validator';

type FormData = {
    name: string;
    telephone: string;
    question: string;
};

type FormField = keyof FormData;
type ErrorField = keyof ValidationErrors;

const FIELD_TO_ERROR_KEY: Record<FormField, ErrorField> = {
    name: 'name',
    telephone: 'telephone',
    question: 'text',
};

function toBookingFormData(data: FormData) {
    return {
        name: data.name,
        telephone: data.telephone,
        text: data.question,
    };
}

type ContactFormProps = {
    submitLabel?: string;
    questionPlaceholder?: string;
    className?: string;
};

function ContactForm({
    submitLabel = 'Отправить',
    questionPlaceholder = 'Ваш вопрос',
    className,
}: ContactFormProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        telephone: '',
        question: '',
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Partial<Record<ErrorField, boolean>>>({});
    const [submitAttempted, setSubmitAttempted] = useState(false);

    useEffect(() => {
        setErrors(getVisibleValidationErrors(toBookingFormData(formData), touched, submitAttempted));
    }, [formData, touched, submitAttempted]);

    const handleInputChange = (field: FormField, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field: FormField) => {
        const errorKey = FIELD_TO_ERROR_KEY[field];
        setTouched((prev) => ({ ...prev, [errorKey]: true }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitAttempted(true);

        const validationErrors = validateBookingForm(toBookingFormData(formData));
        setErrors(validationErrors);

        if (!isFormValid(validationErrors)) return;

        // TODO: отправка формы
    };

    const validationErrors = validateBookingForm(toBookingFormData(formData));
    const isPristine =
        !submitAttempted &&
        !Object.values(touched).some(Boolean) &&
        !formData.name &&
        !formData.telephone &&
        !formData.question;
    const canSubmit = isPristine || isFormValid(validationErrors);

    return (
        <form
            className={[styles.contactForm, className].filter(Boolean).join(' ')}
            onSubmit={handleSubmit}
            noValidate
        >
            <div className={styles.contactForm__field}>
                <input
                    type="text"
                    name="name"
                    placeholder="Ваше имя"
                    className={`${styles.contactForm__input} ${errors.name ? styles.contactForm__input_error : ''}`}
                    value={formData.name}
                    onChange={(event) => handleInputChange('name', event.target.value)}
                    onBlur={() => handleBlur('name')}
                />
                <span className={styles.contactForm__error} aria-hidden={!errors.name}>
                    {errors.name}
                </span>
            </div>

            <div className={styles.contactForm__field}>
                <PatternFormat
                    id="telephone"
                    name="telephone"
                    format="+7 (###) ###-##-##"
                    mask="_"
                    placeholder="+7 (___) ___-__-__"
                    className={`${styles.contactForm__input} ${errors.telephone ? styles.contactForm__input_error : ''}`}
                    value={formData.telephone}
                    onValueChange={(values) => handleInputChange('telephone', values.value)}
                    onBlur={() => handleBlur('telephone')}
                />
                <span className={styles.contactForm__error} aria-hidden={!errors.telephone}>
                    {errors.telephone}
                </span>
            </div>

            <div className={styles.contactForm__field}>
                <textarea
                    name="question"
                    placeholder={questionPlaceholder}
                    className={`${styles.contactForm__textarea} ${errors.text ? styles.contactForm__textarea_error : ''}`}
                    value={formData.question}
                    onChange={(event) => handleInputChange('question', event.target.value)}
                    onBlur={() => handleBlur('question')}
                />
                <span className={styles.contactForm__error} aria-hidden={!errors.text}>
                    {errors.text}
                </span>
            </div>

            <button
                type="submit"
                className={styles.contactForm__button}
                disabled={!canSubmit}
            >
                {submitLabel}
            </button>
        </form>
    );
}

export default ContactForm;
