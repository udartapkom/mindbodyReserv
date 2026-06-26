import React from 'react';
import styles from './SupportCardSection.module.scss';
import SupportCard from '../SupportCard/SupportCard';
import { supportCard } from '@/content/supportCard';

const SupportCardSection = () => {
    return (
        <section className={styles.supportCardSection}>
            {supportCard.map((card) => (
                <SupportCard
                    key={card.id}
                title={card.title} 
                description={card.description} 
                icon={card.icon} 
                buttonText={card.buttonText} 
                link={card.link} />
            ))}
        </section>
    );
};

export default SupportCardSection;