import Link from "next/link";
import styles from "./HomeHowItWorks.module.scss";

const steps = [
  {
    id: "register",
    title: "Зарегистрируйтесь",
    text: "Создайте аккаунт — базовый доступ к части материалов уже включён.",
    href: "/login",
    linkLabel: "Войти или зарегистрироваться",
  },
  {
    id: "choose",
    title: "Выберите тему",
    text: "Откройте готовые решения или инструкции и начните с того, что сейчас важнее.",
    href: "/problems",
    linkLabel: "К готовым решениям",
  },
  {
    id: "learn",
    title: "Работайте в своём темпе",
    text: "Читайте материалы, сохраняйте прогресс в кабинете и возвращайтесь, когда удобно.",
    href: "/cabinet",
    linkLabel: "Личный кабинет",
  },
  {
    id: "support",
    title: "Попросите поддержку",
    text: "Если застряли с выбором или доступом — напишите нам. Отвечаем лично.",
    href: "/support",
    linkLabel: "Написать в поддержку",
  },
] as const;

function HomeHowItWorks() {
  return (
    <section className={styles.section} aria-labelledby="home-how-title">
      <div className={styles.section__inner}>
        <h2 id="home-how-title" className={styles.section__title}>
          Как это работает
        </h2>
        <p className={styles.section__lead}>
          Короткий сценарий: от регистрации до первой темы и поддержки, если она
          нужна.
        </p>
        <ol className={styles.section__list}>
          {steps.map((step, index) => (
            <li key={step.id} className={styles.section__item}>
              <span className={styles.section__num} aria-hidden>
                {index + 1}
              </span>
              <div className={styles.section__content}>
                <h3 className={styles.section__itemTitle}>{step.title}</h3>
                <p className={styles.section__itemText}>{step.text}</p>
                <Link className={styles.section__link} href={step.href}>
                  {step.linkLabel}
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default HomeHowItWorks;
