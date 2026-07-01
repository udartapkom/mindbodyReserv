import type { PriceComparisonRow } from '@/types/PriceComparison';

export const priceComparisonRows: PriceComparisonRow[] = [
    {
        feature: 'Доступ к мыслям и заметкам',
        included: [true, true, true],
    },
    {
        feature: 'Еженедельные инсайты',
        included: [true, true, true],
    },
    {
        feature: 'Цитаты',
        included: [true, true, true],
    },
    {
        feature: 'Отношения и сексуальная психология',
        included: [false, true, false],
    },
    {
        feature: 'Ментальное здоровье и бизнес',
        included: [false, false, true],
    },
    {
        feature: 'Личные консультации',
        included: [false, false, true],
    },
];
