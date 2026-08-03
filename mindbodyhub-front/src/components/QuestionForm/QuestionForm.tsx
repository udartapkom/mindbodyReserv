import Link from 'next/link';
import WriteWeSocial from '../WriteWeSocial/WriteWeSocial';
import ContactForm from '../ContactForm/ContactForm';
import { contactFormCopy } from '@/content/contactFormCopy';
import styles from './QuestionForm.module.scss';

function QuestionForm() {
    const copy = contactFormCopy.home;

    return (
        <section className={styles.questionForm}>
            <div className={styles.questionForm__container}>
                <div className={styles.questionForm__content}>
                    <h2 className={styles.questionForm__title}>{copy.title}</h2>
                    {copy.paragraphs.map((paragraph) => (
                        <p key={paragraph} className={styles.questionForm__text}>
                            {paragraph}
                        </p>
                    ))}
                    <p className={styles.questionForm__support}>
                        Больше способов связаться и FAQ — на странице{' '}
                        <Link href="/support" className={styles.questionForm__link}>
                            поддержки
                        </Link>
                        .
                    </p>
                    <WriteWeSocial />
                </div>

                <ContactForm
                    submitLabel={copy.submitLabel}
                    questionPlaceholder={copy.questionPlaceholder}
                    source="home"
                />
            </div>
        </section>
    );
}

export default QuestionForm;
