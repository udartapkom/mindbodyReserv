'use client';

import SupportCard from '../SupportCard/SupportCard';
import { buildSupportCards } from '@/content/supportCard';
import { useSupportLinks } from '@/hooks/useSupportLinks';
import styles from './SupportCardSection.module.scss';

const SupportCardSection = () => {
  const { links } = useSupportLinks();
  const cards = buildSupportCards(links);

  return (
    <section className={styles.supportCardSection}>
      {cards.map((card) => (
        <SupportCard
          key={card.id}
          title={card.title}
          description={card.description}
          icon={card.icon}
          link={card.link}
        />
      ))}
    </section>
  );
};

export default SupportCardSection;
