'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { payments } from '@/api/api';
import ErrorPopup from '@/components/ErrorPopup/ErrorPopup';
import Popup from '@/components/Popup/Popup';
import { useAuth } from '@/context/AuthContext';
import { Icon } from '@/shared/ui/Icon';
import type { IconName } from '@/shared/ui/Icon';
import styles from './PriceCard.module.scss';

interface PriceCardProps {
    type: string;
    image: string;
    imageAlt: string;
    title: string;
    titleColor?: string | null;
    price: string;
    period: string;
    subTitle: string;
    description: string[];
}

type FormPopup = {
    title: string;
    description: string;
    icon: IconName;
    tone: 'error' | 'success' | 'info';
};

function getErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message?: string | string[] }).message;
        if (Array.isArray(message)) return message.join(', ');
        if (typeof message === 'string') return message;
    }
    return fallback;
}

function PriceCard({
    type,
    image,
    imageAlt,
    title,
    titleColor,
    price,
    period,
    subTitle,
    description,
}: PriceCardProps) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [popup, setPopup] = useState<FormPopup | null>(null);

    const isCurrentTariff = user?.tariff === type;
    const closePopup = () => setPopup(null);

    const handleConnect = async () => {
        if (isLoading || isSubmitting || isCurrentTariff) {
            return;
        }

        if (!isAuthenticated) {
            router.push(`/login?next=${encodeURIComponent('/price')}`);
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await payments.create(type);
            if (!result.paymentUrl) {
                throw { message: 'Платёжная ссылка не получена' };
            }
            window.location.assign(result.paymentUrl);
        } catch (error) {
            setPopup({
                title: 'Ошибка',
                description: getErrorMessage(
                    error,
                    'Не удалось создать оплату. Попробуйте позже.',
                ),
                icon: 'times-circle-o',
                tone: 'error',
            });
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div
                className={styles.priceCard}
                style={titleColor ? { border: `1px solid ${titleColor}` } : undefined}
            >
                <Image
                    className={styles.priceCard__image}
                    src={image}
                    alt={imageAlt}
                    width={260}
                    height={260}
                />
                <h3
                    className={styles.priceCard__title}
                    style={titleColor ? { backgroundColor: titleColor, color: '#fff' } : undefined}
                >
                    {title}
                </h3>
                <div className={styles.priceCard__priceWrapper}>
                    <p className={styles.priceCard__price}>{price}</p>
                    <p className={styles.priceCard__period}>{period}</p>
                </div>
                <h4 className={styles.priceCard__subTitle}>{subTitle}</h4>
                <ul className={styles.priceCard__description}>
                    {description.map((item) => (
                        <li key={item}>
                            <Icon name="check" />
                            <span className={styles.priceCard__descriptionItem}>{item}</span>
                        </li>
                    ))}
                </ul>
                <button
                    type="button"
                    className={styles.priceCard__button}
                    style={
                        titleColor && !isCurrentTariff
                            ? { backgroundColor: titleColor, color: '#fff' }
                            : undefined
                    }
                    onClick={() => void handleConnect()}
                    disabled={isSubmitting || isCurrentTariff || isLoading}
                >
                    {isCurrentTariff
                        ? 'Активен'
                        : isSubmitting
                          ? 'Создание оплаты…'
                          : 'Подключить'}
                </button>
            </div>

            <Popup
                title={popup?.title ?? 'Уведомление'}
                isOpen={popup !== null}
                onClose={closePopup}
            >
                <ErrorPopup
                    title={popup?.title ?? 'Уведомление'}
                    description={popup?.description ?? ''}
                    icon={popup?.icon ?? 'info-circle'}
                    variant="regular"
                    tone={popup?.tone ?? 'error'}
                    submit={closePopup}
                />
            </Popup>
        </>
    );
}

export default PriceCard;
