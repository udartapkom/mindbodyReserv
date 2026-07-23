import PriceComparison from "@/components/PriceComparison/PriceComparison";
import styles from "./page.module.scss";
import PriceQuestionSection from "@/components/PriceQuestionSection/PriceQuestionSection";
import Accordion from "@/components/Accordion/Accordion";
import { priceFaq } from "@/content/PriceFaq";
import PriceCardsClient from "@/components/PriceCardsClient/PriceCardsClient";

function PricePage() {
    return (
        <div className={styles.pricePage}>
            <h1 className={styles.pricePage__title}>Тарифы и цены</h1>
            <p className={styles.pricePage__description}>
                Выберите подходящий вариант доступа к закрытому пространству{" "}
                <span className={styles.pricePage__descriptionSpan}>MindBodyHub</span>
            </p>

            <PriceCardsClient
                className={styles.pricePage__cardWrapper}
                showPaymentResult
            />
            <PriceComparison />
            <section className={styles.pricePage__faq}>
                <h2 className={styles.pricePage__faqTitle}>Часто задаваемые вопросы</h2>
                <Accordion items={priceFaq} />
            </section>
            <div className={styles.pricePage__questionSection}>
                <PriceQuestionSection />
            </div>
        </div>
    );
}

export default PricePage;
