import styles from './PlaceholderPage.module.scss';

type PlaceholderPageProps = {
  title: string;
};

function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className={styles.placeholderPage}>
      <h1 className={styles.placeholderPage__title}>{title}</h1>
      <p className={styles.placeholderPage__text}>Раздел в разработке. Подключим позже.</p>
    </section>
  );
}

export default PlaceholderPage;
