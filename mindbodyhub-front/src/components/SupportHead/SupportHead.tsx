import styles from './SupportHead.module.scss';
import { Icon } from '@/shared/ui/Icon';

function SupportHead() {
    return (
        <section className={styles.supportHead}>
            <div className={styles.supportHead__content}>
                <Icon name="headset" className={styles.supportHead__icon} />
                <h1 className={styles.supportHead__title}>Служба поддержки</h1>
                <p className={styles.supportHead__description}>
                    Мы здесь, чтобы помочь.
                </p>
                <p className={styles.supportHead__description}>Ответим на любые вопросы в течение 
                    <span className={styles.supportHead__descriptionSpan}>&nbsp;15 минут</span>.</p>
            </div>
        </section>
    );
}

export default SupportHead;