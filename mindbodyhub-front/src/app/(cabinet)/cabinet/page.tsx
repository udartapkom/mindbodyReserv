import PaymentResultNotice from '@/components/PaymentResultNotice/PaymentResultNotice';
import ContinueReading from '@/components/Cabinet/ContinueReading/ContinueReading';
import QuoteOfDay from '@/components/Cabinet/QuoteOfDay/QuoteOfDay';
import styles from './page.module.scss';

export default function CabinetDashboardPage() {
  return (
    <section className={styles.dashboard}>
      <header className={styles.dashboard__header}>
        <h1 className={styles.dashboard__title}>Кабинет</h1>
        <p className={styles.dashboard__lead}>
          Главная страница личного кабинета
        </p>
      </header>
      <PaymentResultNotice />
      <ContinueReading />
      <QuoteOfDay />
    </section>
  );
}
