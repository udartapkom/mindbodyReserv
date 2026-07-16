import styles from './SupportCard.module.scss';
import type { SupportCardItem } from '@/types/SupportCard';
import Image from 'next/image';

function SupportCard({
    title,
    description,
    icon,
    link,
}: Omit<SupportCardItem, 'id' | 'buttonText'>) {
    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.supportCard}
        >
            <div className={styles.supportCard__iconContainer}>
                <Image src={icon} alt={title} width={72} height={72} className={styles.supportCard__icon} />
                <h2 className={styles.supportCard__title}>{title}</h2>
                <p className={styles.supportCard__description}>{description}</p>
            </div>
        </a>
    );
}

export default SupportCard;
