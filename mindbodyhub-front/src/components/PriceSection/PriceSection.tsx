import PriceCard from "../PriceCard/PriceCard";
import { cardData } from "@/content/cardData";

import styles from './PriceSection.module.scss';

function PriceSection() {
    return (
        <section className={styles.priceSection}>
            <h2 className={styles.priceSection__title}>Выбери свой путь</h2>
            <div className={styles.priceSection__cardWrapper}>
                {cardData.map((card) => (
                    <PriceCard key={card.type} {...card} />
                ))}
            </div>
        </section>
    )
}

export default PriceSection;