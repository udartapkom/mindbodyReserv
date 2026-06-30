import { Icon } from '@/shared/ui/Icon';
import type { WeData } from '@/types/WeData';
import styles from './WeCard.module.scss';

function WeCard({ title, description, image }: WeData) {
    return (
        <div className={styles.weCard}>
            <Icon name={image} className={styles.weCard__icon} />
            <h3 className={styles.weCard__title}>{title}</h3>
            <p className={styles.weCard__description}>{description}</p>
        </div>
    )
}

export default WeCard;