'use client';

import Image from 'next/image';
import maxIcon from '../../../public/icons/max.svg';
import telegramIcon from '../../../public/icons/telegram.svg';
import vkIcon from '../../../public/icons/vk.svg';
import { useSupportLinks } from '@/hooks/useSupportLinks';
import styles from './WriteWeSocial.module.scss';

function WriteWeSocial() {
  const { links } = useSupportLinks();

  return (
    <div className={styles.writeWeSocial}>
      <a
        href={links.max}
        className={styles.writeWeSocial__icon}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={maxIcon}
          alt="MAX"
          className={styles.writeWeSocial__iconImage}
          width={72}
          height={72}
        />
      </a>
      <a
        href={links.telegram}
        className={styles.writeWeSocial__icon}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={telegramIcon}
          alt="Telegram"
          className={styles.writeWeSocial__iconImage}
          width={72}
          height={72}
        />
      </a>
      <a
        href={links.vk}
        className={styles.writeWeSocial__icon}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={vkIcon}
          alt="VK"
          className={styles.writeWeSocial__iconImage}
          width={72}
          height={72}
        />
      </a>
    </div>
  );
}

export default WriteWeSocial;
