'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PatternFormat } from 'react-number-format';
import { tickets } from '@/api/api';
import ErrorPopup from '@/components/ErrorPopup/ErrorPopup';
import Popup from '@/components/Popup/Popup';
import type { IconName } from '@/shared/ui/Icon';
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
type TicketSource = 'home' | 'support' | 'cabinet' | 'other';

type FormPopup = {
    title: string;
    description: string;
    icon: IconName;
    tone: 'error' | 'success';
};

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

function getErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message?: string | string[] }).message;
        if (Array.isArray(message)) return message.join(', ');
        if (typeof message === 'string') return message;
    }
    return fallback;
}

type ContactFormProps = {
    submitLabel?: string;
    questionPlaceholder?: string;
    className?: string;
    source?: TicketSource;
};

function ContactForm({
    submitLabel = 'Отправить',
    questionPlaceholder = 'Ваш вопрос',
    className,
    source = 'other',
}: ContactFormProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        telephone: '',
        question: '',
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Partial<Record<ErrorField, boolean>>>({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [popup, setPopup] = useState<FormPopup | null>(null);

    useEffect(() => {
        setErrors(getVisibleValidationErrors(toBookingFormData(formData), touched, submitAttempted));
    }, [formData, touched, submitAttempted]);

    const closePopup = () => setPopup(null);

    const handleInputChange = (field: FormField, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field: FormField) => {
        const errorKey = FIELD_TO_ERROR_KEY[field];
        setTouched((prev) => ({ ...prev, [errorKey]: true }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitAttempted(true);

        const validationErrors = validateBookingForm(toBookingFormData(formData));
        setErrors(validationErrors);

        if (!isFormValid(validationErrors)) return;

        setIsSubmitting(true);

        try {
            await tickets.create({
                name: formData.name.trim(),
                phone: formData.telephone,
                message: formData.question.trim(),
                source,
            });

            setFormData({ name: '', telephone: '', question: '' });
            setTouched({});
            setSubmitAttempted(false);
            setErrors({});
            setPopup({
                title: 'Готово',
                description: 'Спасибо! Обращение отправлено. Мы ответим в течение рабочего дня.',
                icon: 'check-circle-o',
                tone: 'success',
            });
        } catch (error) {
            setPopup({
                title: 'Ошибка',
                description: getErrorMessage(
                    error,
                    'Не удалось отправить обращение. Попробуйте ещё раз.',
                ),
                icon: 'times-circle-o',
                tone: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const validationErrors = validateBookingForm(toBookingFormData(formData));
    const isPristine =
        !submitAttempted &&
        !Object.values(touched).some(Boolean) &&
        !formData.name &&
        !formData.telephone &&
        !formData.question;
    const canSubmit = !isSubmitting && (isPristine || isFormValid(validationErrors));

    return (
        <>
            <form
                className={[styles.contactForm, className].filter(Boolean).join(' ')}
                onSubmit={(event) => void handleSubmit(event)}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                    {isSubmitting ? 'Отправка…' : submitLabel}
                </button>
            </form>

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
                    tone={popup?.tone ?? 'error'}
                    submit={closePopup}
                />
            </Popup>
        </>
    );
}

export default ContactForm;
