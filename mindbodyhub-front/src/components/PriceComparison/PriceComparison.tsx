import { cardData } from '@/content/cardData';
import { priceComparisonRows } from '@/content/priceComparison';
import { Icon } from '@/shared/ui/Icon';
import styles from './PriceComparison.module.scss';

function PriceComparison() {
    return (
        <section className={styles.priceComparison} aria-labelledby="price-comparison-title">
            <h2 id="price-comparison-title" className={styles.priceComparison__title}>
                Сравнение тарифов
            </h2>
            <div className={styles.priceComparison__scroll}>
                <div className={styles.priceComparison__table} role="table">
                    <div className={`${styles.priceComparison__row} ${styles.priceComparison__row_header}`} role="row">
                        <div className={styles.priceComparison__cell} role="columnheader">
                            Возможности
                        </div>
                        {cardData.map((plan) => (
                            <div key={plan.type} className={styles.priceComparison__cell} role="columnheader">
                                <span className={styles.priceComparison__planName}>{plan.subTitle}</span>
                                <span className={styles.priceComparison__planPrice}>
                                    {plan.price}
                                    {plan.period}
                                </span>
                            </div>
                        ))}
                    </div>
                    {priceComparisonRows.map((row) => (
                        <div key={row.feature} className={styles.priceComparison__row} role="row">
                            <div className={`${styles.priceComparison__cell} ${styles.priceComparison__cell_feature}`} role="rowheader">
                                {row.feature}
                            </div>
                            {row.included.map((isIncluded, index) => (
                                <div key={index} className={styles.priceComparison__cell} role="cell">
                                    <Icon
                                        name={isIncluded ? 'check' : 'circle'}
                                        variant={isIncluded ? 'solid' : 'regular'}
                                        title={isIncluded ? 'Включено' : 'Не включено'}
                                        className={
                                            isIncluded
                                                ? styles.priceComparison__icon_included
                                                : styles.priceComparison__icon_excluded
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default PriceComparison;
