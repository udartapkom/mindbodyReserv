'use client';

import SupportCard from '@/components/SupportCard/SupportCard';
import { buildSupportCards } from '@/content/supportCard';
import { useSupportLinks } from '@/hooks/useSupportLinks';
import styles from './PriceQuestionSection.module.scss';

function PriceQuestionSection() {
  const { links } = useSupportLinks();
  const cards = buildSupportCards(links);

  return (
    <section className={styles.priceQuestionSection}>
      <h2 className={styles.priceQuestionSection__title}>Остались вопросы по тарифам?</h2>
      <p className={styles.priceQuestionSection__description}>
        Напишите в поддержку — поможем с оплатой, доступом и выбором тарифа
      </p>
      <div className={styles.priceQuestionSection__cards}>
        {cards.map((card) => (
          <SupportCard
            key={card.id}
            title={card.title}
            description={card.description}
            icon={card.icon}
            link={card.link}
          />
        ))}
      </div>
    </section>
  );
}

export default PriceQuestionSection;
