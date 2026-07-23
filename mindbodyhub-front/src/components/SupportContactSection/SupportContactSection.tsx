import WriteWeSocial from '../WriteWeSocial/WriteWeSocial';
import ContactForm from '../ContactForm/ContactForm';
import { contactFormCopy } from '@/content/contactFormCopy';
import styles from './SupportContactSection.module.scss';

function SupportContactSection() {
    const copy = contactFormCopy.support;

    return (
        <section className={styles.supportContactSection}>
            <div className={styles.supportContactSection__container}>
                <div className={styles.supportContactSection__content}>
                    <h2 className={styles.supportContactSection__title}>{copy.title}</h2>
                    {copy.paragraphs.map((paragraph) => (
                        <p key={paragraph} className={styles.supportContactSection__text}>
                            {paragraph}
                        </p>
                    ))}
                    <WriteWeSocial />
                </div>

                <ContactForm
                    submitLabel={copy.submitLabel}
                    questionPlaceholder={copy.questionPlaceholder}
                    source="support"
                />
            </div>
        </section>
    );
}

export default SupportContactSection;
