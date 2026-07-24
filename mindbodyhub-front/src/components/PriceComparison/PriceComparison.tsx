'use client';

import { useEffect, useState } from 'react';
import { tariffsApi, type PublicTariff } from '@/api/api';
import { cardData } from '@/content/cardData';
import { priceComparisonRows as fallbackRows } from '@/content/priceComparison';
import type { PriceComparisonRow } from '@/types/PriceComparison';
import { Icon } from '@/shared/ui/Icon';
import styles from './PriceComparison.module.scss';

function PriceComparison() {
    const [plans, setPlans] = useState<PublicTariff[]>([]);
    const [rows, setRows] = useState<PriceComparisonRow[]>([]);

    useEffect(() => {
        let cancelled = false;

        void Promise.all([
            tariffsApi.getPublic(),
            tariffsApi.getComparisonPublic(),
        ])
            .then(([tariffs, comparison]) => {
                if (cancelled) return;
                if (tariffs.length > 0) {
                    setPlans(tariffs);
                }
                if (comparison.rows.length > 0) {
                    setRows(comparison.rows);
                }
            })
            .catch(() => {
                // keep fallbacks below
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const headerPlans =
        plans.length > 0
            ? plans
            : cardData.map((card) => ({
                  id: card.type,
                  type: card.type,
                  title: card.title,
                  titleColor: card.titleColor ?? null,
                  price: card.price,
                  period: card.period,
                  subTitle: card.subTitle,
                  description: card.description,
                  image: card.image,
                  imageAlt: card.imageAlt,
                  sortOrder: 0,
              }));

    const tableRows: PriceComparisonRow[] =
        rows.length > 0
            ? rows
            : fallbackRows.map((row, index) => ({
                  id: `fallback-${index}`,
                  feature: row.feature,
                  included: Object.fromEntries(
                      headerPlans.map((plan, planIndex) => [
                          plan.type,
                          row.included[planIndex] === true,
                      ]),
                  ),
                  sortOrder: index,
              }));

    return (
        <section className={styles.priceComparison} aria-labelledby="price-comparison-title">
            <h2 id="price-comparison-title" className={styles.priceComparison__title}>
                Сравнение тарифов
            </h2>
            <div className={styles.priceComparison__scroll}>
                <div className={styles.priceComparison__table} role="table">
                    <div className={`${styles.priceComparison__row} ${styles.priceComparison__row_header}`} role="row">
                        <div className={styles.priceComparison__cell} role="columnheader">
                            Возможности
                        </div>
                        {headerPlans.map((plan) => (
                            <div key={plan.type} className={styles.priceComparison__cell} role="columnheader">
                                <span className={styles.priceComparison__planName}>{plan.subTitle}</span>
                                <span className={styles.priceComparison__planPrice}>
                                    {plan.price}
                                    {plan.period}
                                </span>
                            </div>
                        ))}
                    </div>
                    {tableRows.map((row) => (
                        <div key={row.id} className={styles.priceComparison__row} role="row">
                            <div className={`${styles.priceComparison__cell} ${styles.priceComparison__cell_feature}`} role="rowheader">
                                {row.feature}
                            </div>
                            {headerPlans.map((plan) => {
                                const isIncluded = row.included[plan.type] === true;
                                return (
                                    <div key={plan.type} className={styles.priceComparison__cell} role="cell">
                                        <Icon
                                            name={isIncluded ? 'check' : 'circle'}
                                            variant={isIncluded ? 'solid' : 'regular'}
                                            title={isIncluded ? 'Включено' : 'Не включено'}
                                            className={
                                                isIncluded
                                                    ? styles.priceComparison__icon_included
                                                    : styles.priceComparison__icon_excluded
                                            }
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default PriceComparison;
