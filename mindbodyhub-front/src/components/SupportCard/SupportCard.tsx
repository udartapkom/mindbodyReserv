'use client';
import styles from './SupportCard.module.scss';
import type { SupportCardItem } from '@/types/SupportCard';
import Image from 'next/image';

function SupportCard(
    { 
        title, 
        description, 
        icon, 
        buttonText, 
        link 
    }: Omit<SupportCardItem, 'id'>) {
        
        const handleClick = () => {
            console.log('clicked');
        };
    return (
        <div className={styles.supportCard} onClick={handleClick}>
             <div className={styles.supportCard__iconContainer}>
                <Image src={icon} alt={title} width={72} height={72} className={styles.supportCard__icon} />
                <h2 className={styles.supportCard__title}>{title}</h2>
                <p className={styles.supportCard__description}>{description}</p>
             </div>
            {/* <button onClick={handleClick} className={styles.supportCard__button}>{buttonText}</button> */}
        </div>
    );
}

export default SupportCard;