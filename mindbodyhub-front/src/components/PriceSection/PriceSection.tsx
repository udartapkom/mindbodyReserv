import styles from './PriceSection.module.scss';
import PriceCardsClient from '@/components/PriceCardsClient/PriceCardsClient';

function PriceSection() {
    return (
        <section className={styles.priceSection}>
            <h2 className={styles.priceSection__title}>Выбери свой путь</h2>
            <PriceCardsClient className={styles.priceSection__cardWrapper} />
        </section>
    );
}

export default PriceSection;
