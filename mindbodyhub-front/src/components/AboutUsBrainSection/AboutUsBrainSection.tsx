import styles from './AboutUsBrainSection.module.scss';
import { Icon } from '@/shared/ui/Icon';

function AboutUsBrainSection() {
    return (
        <section className={styles.aboutUsBrainSection}>
            <div className={styles.aboutUsBrainSection__container}>
                <Icon name="brain" className={styles.aboutUsBrainSection__icon} />
                <h2 className={styles.aboutUsBrainSection__title}>
                    О нас
                </h2>
                <h3 className={styles.aboutUsBrainSection__description}>
                    <span className={styles.aboutUsBrainSection__description_bold}>MindBodyHub&nbsp;</span> 
                    — пространство для самостоятельной работы над собой
                </h3>
            </div>
        </section>
    );
}

export default AboutUsBrainSection;