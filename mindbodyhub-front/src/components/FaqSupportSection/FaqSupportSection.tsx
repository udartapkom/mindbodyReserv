import styles from './FaqSupportSection.module.scss';
import Accordion from '@/components/Accordion/Accordion';
import { whatWriteFaq } from '@/content/WhatWriteFaq';

function FaqSupportSection() {
    return (
        <section className={styles.faqSupportSection}>
            <div className={styles.faqSupportSection__container}>
                <h2 className={styles.faqSupportSection__title}>FAQ</h2>
                <Accordion items={whatWriteFaq} />
            </div>
        </section>
    );
}

export default FaqSupportSection;