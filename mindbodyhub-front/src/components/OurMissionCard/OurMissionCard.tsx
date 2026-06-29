import { Icon } from '@/shared/ui/Icon';
import styles from './OurMissionCard.module.scss';
import type { OurMissionCard as OurMissionCardType } from '@/types/OurMissionCard';

function OurMissionCard({ title, description, icon, text }: OurMissionCardType) {
    return (
            <div className={styles.ourMissionCard}>
                <div className={styles.ourMissionCard__iconContainer}>
                    <Icon name={icon} className={styles.ourMissionCard__icon} />
                    <h3 className={styles.ourMissionCard__title}>{title}</h3>
                    <p className={styles.ourMissionCard__description}>{description}</p>
                </div>
                <div className={styles.ourMissionCard__text}>
                    <div className={styles.ourMissionCard__textInner} dangerouslySetInnerHTML={{ __html: text }} />
                </div>
            </div>
            

    );
}

export default OurMissionCard;