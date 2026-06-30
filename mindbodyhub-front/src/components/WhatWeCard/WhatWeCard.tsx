import { Icon } from '@/shared/ui/Icon';
import styles from './WhatWeCard.module.scss';
import { WeData } from '@/types/WeData';

function WhatWeCard({ id, title, description, image }: WeData) {
    return (
        <div className={styles.whatWeCard}>
            <div className={styles.whatWeCard__container}>
                <Icon name={image} className={styles.whatWeCard__icon} />
                <h3 className={styles.whatWeCard__title}>{title}</h3>
                <p className={styles.whatWeCard__description}>{description}</p>
            </div>
        </div>
    );
}

export default WhatWeCard;