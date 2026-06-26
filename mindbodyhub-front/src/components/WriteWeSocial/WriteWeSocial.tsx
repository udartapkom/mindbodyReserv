import maxIcon from '../../../public/icons/max.svg';
import telegramIcon from '../../../public/icons/telegram.svg';
import vkIcon from '../../../public/icons/vk.svg';
import styles from './WriteWeSocial.module.scss';
import Image from 'next/image';

function WriteWeSocial() {
    return (
        <div className={styles.writeWeSocial}>
            <a href="https://max.com" className={styles.writeWeSocial__icon}>
                <Image src={maxIcon} alt="MAX" className={styles.writeWeSocial__iconImage} width={72} height={72} />
            </a>
            <a href="https://t.me/mbh_support" className={styles.writeWeSocial__icon}>
                <Image src={telegramIcon} alt="Telegram" className={styles.writeWeSocial__iconImage} width={72} height={72} />
            </a>
            <a href="https://vk.com/mindbodyhubpro" className={styles.writeWeSocial__icon}>
                        <Image src={vkIcon} alt="VK" className={styles.writeWeSocial__iconImage} width={72} height={72} />
            </a>
        </div>
    );
}

export default WriteWeSocial;