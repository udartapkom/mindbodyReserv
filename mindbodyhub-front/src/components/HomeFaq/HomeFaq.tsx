import Accordion from "@/components/Accordion/Accordion";
import { homeFaq } from "@/content/homeFaq";
import styles from "./HomeFaq.module.scss";

function HomeFaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeFaq.map((item) => ({
      "@type": "Question",
      name: item.title,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function HomeFaq() {
  return (
    <section className={styles.section} aria-labelledby="home-faq-title">
      <HomeFaqJsonLd />
      <div className={styles.section__inner}>
        <h2 id="home-faq-title" className={styles.section__title}>
          Частые вопросы
        </h2>
        <Accordion items={homeFaq} />
      </div>
    </section>
  );
}

export default HomeFaq;
