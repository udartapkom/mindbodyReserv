import type { WhatWriteFaq as WhatWriteFaqType } from '@/types/WhatWriteFaq';

export const whatWriteFaq: WhatWriteFaqType[] = [
    {
        id: 1,
        title: 'Нет доступа после оплаты',
        answer: 'Доступ откроется автоматически. Если не сработало — напишите в поддержку с датой оплаты.',
        color: 'linear-gradient(to right, #ffffff 0%, #f5f9ff 45%, #e8f0fe 100%)',
    },
    {
        id: 2,
        title: 'Условия возврата',
        answer: 'Отказ в течение 3 дней после оплаты. Возврат не делается, если вы уже пользовались платным доступом. Заявку оформляем через поддержку.',
        color: 'linear-gradient(to right, #ffffff 0%, #f5f9ff 45%, #e8f0fe 100%)',
    },
    {
        id: 3,
        title: 'Что входит в бесплатный тариф?',
        answer: 'Базовый доступ навсегда — подробности на главной в блоке тарифов.',
        color: 'linear-gradient(to right, #ffffff 0%, #f5f9ff 45%, #e8f0fe 100%)',
    },
    {
        id: 4,
        title: 'Это медицинская помощь?',
        answer: 'Нет. Информация ознакомительная. При серьёзных состояниях обращайтесь к специалистам очно.',
        color: 'linear-gradient(to right, #ffffff 0%, #f5f9ff 45%, #e8f0fe 100%)',
    },
];