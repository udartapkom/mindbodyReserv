import Link from 'next/link';
import styles from './We.module.scss';
import WeCard from '../WeCard/WeCard';
import { weData } from '@/content/WeData';

function We() {
    return (
        <section className={styles.we}>
            <header className={styles.we__header}>
                <h2 className={styles.we__title}>Мы</h2>
                <p className={styles.we__lead}>
                    Онлайн-платформа ментального здоровья: забота, реальный опыт,
                    конфиденциальность и поддержка в любое время
                </p>
                <p className={styles.we__about}>
                    MindBodyHub появился, чтобы дать опору тем, кто работает
                    с запросами сам — с понятными инструментами и без давления.{' '}
                    <Link href="/about" className={styles.we__link}>
                        Подробнее о нас
                    </Link>
                </p>
            </header>
            <div className={styles.we__container}>
                {weData.map((item) => (
                    <WeCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        image={item.image}
                    />
                ))}
            </div>
        </section>
    )
}

export default We;