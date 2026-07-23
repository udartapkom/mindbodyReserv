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
