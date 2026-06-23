import styles from './We.module.scss';
import WeCard from '../WeCard/WeCard';
import { weData } from '@/content/WeData';

function We() {
    return (
        <section className={styles.we}>
            <h2 className={styles.we__title}>Мы</h2>
            <div className={styles.we__container}>
                {weData.map((item) => (
                    <WeCard
                        key={item.title}
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