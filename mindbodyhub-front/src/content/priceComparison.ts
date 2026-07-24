/** Fallback for offline until API comparison is loaded */
export type StaticPriceComparisonRow = {
    feature: string;
    included: [boolean, boolean, boolean];
};

export const priceComparisonRows: StaticPriceComparisonRow[] = [
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
