import { ourMissionCard } from '@/content/OurMissionCard';
import styles from './OurMissionSection.module.scss';
import OurMissionCard from '../OurMissionCard/OurMissionCard';

function OurMissionSection() {
    return (
        <section className={styles.ourMissionSection}>
            <div className={styles.ourMissionSection__container}>
                <h2 className={styles.ourMissionSection__title}>Наша миссия</h2>
                <div className={styles.ourMissionSection__contentContainer}>
                    <div className={styles.ourMissionSection__cards}>
                        {ourMissionCard.map((card) => (
                            <OurMissionCard key={card.id} {...card} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default OurMissionSection;