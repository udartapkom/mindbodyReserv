'use client';
import { FormEvent, useEffect, useState } from 'react';
import { PatternFormat } from 'react-number-format';
import WriteWeSocial from '../WriteWeSocial/WriteWeSocial';
import styles from './QuestionForm.module.scss';
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

function QuestionForm() {
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
        <section className={styles.questionForm}>
            <div className={styles.questionForm__container}>
                <div className={styles.questionForm__content}>
                    <h2 className={styles.questionForm__title}>Напишите нам</h2>
                    <p className={styles.questionForm__text}>
                        Остались вопросы о платформе, тарифах или том, с чего начать?
                        Расскажите — ответим лично и поможем разобраться.
                    </p>
                    <p className={styles.questionForm__text}>
                        Оставьте контакты и свой вопрос в форме. 
                    </p>
                    <p className={styles.questionForm__text}>
                        Обычно отвечаем в течение рабочего дня. Конфиденциально и без навязчивых рассылок.
                    </p>
                    <p className={styles.questionForm__text}>
                        Конфиденциально и без навязчивых рассылок.
                    </p>
{/*                     <Image
                        src={questionFormImage}
                        alt="Question Form"
                        className={styles.questionForm__image}
                        width={500}
                        height={300}
                        priority
                    /> */}
                    <WriteWeSocial />
                    <div className={styles.questionForm__imageContainer}>

                    </div>
                </div>

                <form className={styles.questionForm__form} onSubmit={handleSubmit} noValidate>
                    <div className={styles.questionForm__field}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Ваше имя"
                            className={`${styles.questionForm__formInput} ${errors.name ? styles.questionForm__formInput_error : ''}`}
                            value={formData.name}
                            onChange={(event) => handleInputChange('name', event.target.value)}
                            onBlur={() => handleBlur('name')}
                        />
                        <span className={styles.questionForm__error} aria-hidden={!errors.name}>
                            {errors.name}
                        </span>
                    </div>

                    <div className={styles.questionForm__field}>
                        <PatternFormat
                            id="telephone"
                            name="telephone"
                            format="+7 (###) ###-##-##"
                            mask="_"
                            placeholder="+7 (___) ___-__-__"
                            className={`${styles.questionForm__formInput} ${errors.telephone ? styles.questionForm__formInput_error : ''}`}
                            value={formData.telephone}
                            onValueChange={(values) => handleInputChange('telephone', values.value)}
                            onBlur={() => handleBlur('telephone')}
                        />
                        <span className={styles.questionForm__error} aria-hidden={!errors.telephone}>
                            {errors.telephone}
                        </span>
                    </div>

                    <div className={styles.questionForm__field}>
                        <textarea
                            name="question"
                            placeholder="Ваш вопрос"
                            className={`${styles.questionForm__formTextarea} ${errors.text ? styles.questionForm__formTextarea_error : ''}`}
                            value={formData.question}
                            onChange={(event) => handleInputChange('question', event.target.value)}
                            onBlur={() => handleBlur('question')}
                        />
                        <span className={styles.questionForm__error} aria-hidden={!errors.text}>
                            {errors.text}
                        </span>
                    </div>

                    <button
                        type="submit"
                        className={styles.questionForm__formButton}
                        disabled={!canSubmit}
                    >
                        Отправить
                    </button>
                </form>
            </div>
        </section>
    );
}

export default QuestionForm;
