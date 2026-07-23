'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ErrorPopup from '@/components/ErrorPopup/ErrorPopup';
import Popup from '@/components/Popup/Popup';
import { useAuth } from '@/context/AuthContext';
import type { IconName } from '@/shared/ui/Icon';

type FormPopup = {
  title: string;
  description: string;
  icon: IconName;
  tone: 'error' | 'success' | 'info';
};

function PaymentResultInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [popup, setPopup] = useState<FormPopup | null>(null);

  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment !== 'success') {
      return;
    }

    void refreshUser().catch(() => undefined);
    setPopup({
      title: 'Оплата принята',
      description:
        'Если платёж подтверждён, тариф обновится в течение минуты. При необходимости обновите страницу.',
      icon: 'check-circle-o',
      tone: 'success',
    });
  }, [searchParams, refreshUser]);

  const closePopup = () => {
    setPopup(null);
    router.replace('/cabinet');
  };

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

function PaymentResultNotice() {
  return (
    <Suspense fallback={null}>
      <PaymentResultInner />
    </Suspense>
  );
}

export default PaymentResultNotice;
