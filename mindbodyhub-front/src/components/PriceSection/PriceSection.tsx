import Link from 'next/link';
import styles from './PriceSection.module.scss';
import PriceCardsClient from '@/components/PriceCardsClient/PriceCardsClient';

function PriceSection() {
    return (
        <section className={styles.priceSection}>
            <h2 className={styles.priceSection__title}>Выбери свой путь</h2>
            <p className={styles.priceSection__lead}>
                Сравните возможности и условия на странице{' '}
                <Link href="/price" className={styles.priceSection__link}>
                    тарифов
                </Link>
                .
            </p>
            <PriceCardsClient className={styles.priceSection__cardWrapper} />
        </section>
    );
}

export default PriceSection;
