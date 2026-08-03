import Link from 'next/link';
import styles from './AttentionSection.module.scss';
import { Icon } from '@/shared/ui/Icon';

function AttentionSection() {
    return (
        <section className={styles.attentionSection}>
            <Icon name="circle-info" className={styles.attentionSection__icon} />
            <h2 className={styles.attentionSection__heading}>Перед покупкой важно знать</h2>
            <div className={styles.attentionSection__cardContainer}>
                <div className={styles.attentionSection__card}>
                   <Icon name="gem" className={styles.attentionSection__cardIcon} />
                   <div className={styles.attentionSection__cardContent}>
                    <h3 className={styles.attentionSection__cardTitle}>Базовый тариф уже активен</h3>
                    <p className={styles.attentionSection__text}>
                        Бесплатный доступ навсегда —{' '}
                        <Link href="/price" className={styles.attentionSection__link}>
                            подробнее о тарифах
                        </Link>
                    </p>
                   </div>
                </div>
                <div className={styles.attentionSection__card}>
                   <Icon name="users" className={styles.attentionSection__cardIcon} />
                   <div className={styles.attentionSection__cardContent}>
                    <h3 className={styles.attentionSection__cardTitle}>Реальные примеры</h3>
                    <p className={styles.attentionSection__text}>
                    Форум основан на реальных жизненных ситуациях и опыте участников
                    </p>
                   </div>
                </div>
                <div className={styles.attentionSection__card}>
                   <Icon name="toolbox" className={styles.attentionSection__cardIcon} />
                   <div className={styles.attentionSection__cardContent}>
                    <h3 className={styles.attentionSection__cardTitle}>Это инструмент</h3>
                    <p className={styles.attentionSection__text}>
                    Мы даём инструменты, а ты сам работаешь над своими задачами
                    </p>
                   </div>
                </div>
                <div className={styles.attentionSection__card}>
                   <Icon name="brain" className={styles.attentionSection__cardIcon} />
                   <div className={styles.attentionSection__cardContent}>
                    <h3 className={styles.attentionSection__cardTitle}>Не медицинская услуга</h3>
                    <p className={styles.attentionSection__text}>
                    Информация носит ознакомительный характер. При серьёзных проблемах обращайтесь к специалистам
                    </p>
                   </div>
                </div>
            </div>
        </section>
    )
}

export default AttentionSection;    