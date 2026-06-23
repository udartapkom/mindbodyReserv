import styles from './PriceCard.module.scss';
import { Icon } from '@/shared/ui/Icon';
import Image from 'next/image';

interface PriceCardProps {
    image: string;
    imageAlt: string;
    title: string;
    titleColor?: string;
    price: string;
    period: string;
    subTitle: string;
    description: string[];
}

function PriceCard({ 
    image,
    imageAlt,
    title, 
    titleColor,
    price, 
    period, 
    subTitle, 
    description }: PriceCardProps) {

    return (
        <div className={styles.priceCard} style={titleColor ? { border: `1px solid ${titleColor}` } : undefined}>
            <Image
                className={styles.priceCard__image}
                src={image}
                alt={imageAlt}
                width={260}
                height={260}
            />
            <h3 className={styles.priceCard__title}
                style={titleColor ? { backgroundColor: titleColor, color: '#fff' } : undefined}>
                {title}
            </h3>
            <div className={styles.priceCard__priceWrapper}>
                <p className={styles.priceCard__price}>{price}</p>
                <p className={styles.priceCard__period}>{period}</p>
            </div>
            <h4 className={styles.priceCard__subTitle}>{subTitle}</h4>
            <ul className={styles.priceCard__description}>
                {description.map((item, index) => (
                    <li key={index}>
                        <Icon name="check" />
                        <span className={styles.priceCard__descriptionItem}>{item}</span>
                    </li>
                ))}
            </ul>
            <button
                className={styles.priceCard__button}
                style={titleColor ? { backgroundColor: titleColor, color: '#fff' } : undefined}>
                    Подключить
            </button>
        </div>
    )
}

export default PriceCard;