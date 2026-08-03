import Link from "next/link";
import { homeTopics } from "@/content/homeTopics";
import styles from "./HomeHelpTopics.module.scss";

function HomeHelpTopics() {
  return (
    <section className={styles.section} aria-labelledby="home-help-topics-title">
      <div className={styles.section__inner}>
        <h2 id="home-help-topics-title" className={styles.section__title}>
          С чем помогаем
        </h2>
        <p className={styles.section__lead}>
          Темы, с которыми чаще всего приходят на платформу. Выберите запрос —
          дальше можно разобрать его в готовых решениях.
        </p>
        <ul className={styles.section__list}>
          {homeTopics.map((topic) => (
            <li key={topic.id}>
              <Link className={styles.section__card} href="/problems">
                <h3 className={styles.section__cardTitle}>{topic.title}</h3>
                <p className={styles.section__cardText}>{topic.description}</p>
              </Link>
            </li>
          ))}
        </ul>
        <Link className={styles.section__cta} href="/problems">
          Смотреть готовые решения
        </Link>
      </div>
    </section>
  );
}

export default HomeHelpTopics;
