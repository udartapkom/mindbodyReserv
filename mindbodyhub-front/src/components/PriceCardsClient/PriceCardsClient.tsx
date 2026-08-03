'use client';

import { Suspense } from 'react';
import PriceCardsGrid from '@/components/PriceCardsGrid/PriceCardsGrid';
import { cardData } from '@/content/cardData';
import PriceCard from '@/components/PriceCard/PriceCard';

type PriceCardsClientProps = {
  className?: string;
  showPaymentResult?: boolean;
};

function PriceCardsFallback({ className }: { className?: string }) {
  return (
    <div className={className}>
      {cardData.map((card) => (
        <PriceCard key={card.type} {...card} />
      ))}
    </div>
  );
}

function PriceCardsClient({ className, showPaymentResult }: PriceCardsClientProps) {
  // Home path: no useSearchParams → no Suspense bailout / hydration flash.
  if (!showPaymentResult) {
    return <PriceCardsGrid className={className} />;
  }

  return (
    <Suspense fallback={<PriceCardsFallback className={className} />}>
      <PriceCardsGrid className={className} showPaymentResult />
    </Suspense>
  );
}

export default PriceCardsClient;
