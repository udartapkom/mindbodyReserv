'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { tariffsApi, type PublicTariff } from '@/api/api';
import ErrorPopup from '@/components/ErrorPopup/ErrorPopup';
import Popup from '@/components/Popup/Popup';
import PriceCard from '@/components/PriceCard/PriceCard';
import { cardData } from '@/content/cardData';
import type { CardData } from '@/types/cardData';
import type { IconName } from '@/shared/ui/Icon';

type FormPopup = {
  title: string;
  description: string;
  icon: IconName;
  tone: 'error' | 'success' | 'info';
};

function mapTariffToCard(tariff: PublicTariff): CardData {
  return {
    type: tariff.type,
    image: tariff.image,
    imageAlt: tariff.imageAlt,
    title: tariff.title,
    titleColor: tariff.titleColor ?? undefined,
    price: tariff.price,
    period: tariff.period,
    subTitle: tariff.subTitle,
    description: tariff.description ?? [],
  };
}

type PriceCardsGridProps = {
  className?: string;
  showPaymentResult?: boolean;
};

function usePublicTariffCards() {
  const [cards, setCards] = useState<CardData[]>(cardData);

  useEffect(() => {
    let cancelled = false;

    void tariffsApi
      .getPublic()
      .then((tariffs) => {
        if (cancelled || tariffs.length === 0) return;
        setCards(tariffs.map(mapTariffToCard));
      })
      .catch(() => {
        // keep static fallback
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return cards;
}

function PaymentFailNotice() {
  const searchParams = useSearchParams();
  const [popup, setPopup] = useState<FormPopup | null>(null);

  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'fail') {
      setPopup({
        title: 'Оплата не завершена',
        description:
          'Платёж отменён или не прошёл. Можете выбрать тариф и попробовать снова.',
        icon: 'times-circle-o',
        tone: 'error',
      });
    }
  }, [searchParams]);

  const closePopup = () => setPopup(null);

  return (
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
        tone={popup?.tone ?? 'info'}
        submit={closePopup}
      />
    </Popup>
  );
}

function PriceCardsGrid({ className, showPaymentResult = false }: PriceCardsGridProps) {
  const cards = usePublicTariffCards();

  return (
    <>
      <div className={className}>
        {cards.map((card) => (
          <PriceCard key={card.type} {...card} />
        ))}
      </div>
      {showPaymentResult ? <PaymentFailNotice /> : null}
    </>
  );
}

export default PriceCardsGrid;
