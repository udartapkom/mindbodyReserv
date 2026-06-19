import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>MindBodyHub</h1>
      <p className={styles.subtitle}>
        Психология здоровья и бизнеса. Новая версия сайта на Next.js.
      </p>
    </main>
  );
}
