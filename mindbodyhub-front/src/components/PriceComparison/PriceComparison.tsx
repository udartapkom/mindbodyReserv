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
    const [activePlanType, setActivePlanType] = useState<string | null>(null);

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

    const defaultPlanType =
        headerPlans.length === 0
            ? null
            : headerPlans.length === 3
              ? headerPlans[1].type
              : headerPlans[0].type;

    const resolvedActivePlanType = activePlanType ?? defaultPlanType;
    const activePlan =
        headerPlans.find((plan) => plan.type === resolvedActivePlanType) ?? headerPlans[0];

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

            {activePlan ? (
                <div className={styles.priceComparison__tabs}>
                    <div
                        className={styles.priceComparison__tabList}
                        role="tablist"
                        aria-label="Тарифы для сравнения"
                    >
                        {headerPlans.map((plan) => {
                            const isActive = plan.type === activePlan.type;
                            return (
                                <button
                                    key={plan.type}
                                    type="button"
                                    role="tab"
                                    id={`price-comparison-tab-${plan.type}`}
                                    aria-selected={isActive}
                                    aria-controls={`price-comparison-panel-${plan.type}`}
                                    tabIndex={isActive ? 0 : -1}
                                    className={
                                        isActive
                                            ? `${styles.priceComparison__tab} ${styles.priceComparison__tab_active}`
                                            : styles.priceComparison__tab
                                    }
                                    onClick={() => setActivePlanType(plan.type)}
                                >
                                    <span className={styles.priceComparison__tabTitle}>{plan.title}</span>
                                    <span className={styles.priceComparison__tabPrice}>
                                        {plan.price}
                                        {plan.period}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div
                        className={styles.priceComparison__tabPanel}
                        role="tabpanel"
                        id={`price-comparison-panel-${activePlan.type}`}
                        aria-labelledby={`price-comparison-tab-${activePlan.type}`}
                    >
                        <div className={styles.priceComparison__tabHeader}>
                            <span className={styles.priceComparison__planName}>{activePlan.subTitle}</span>
                            <span className={styles.priceComparison__planPrice}>
                                {activePlan.price}
                                {activePlan.period}
                            </span>
                        </div>
                        <ul className={styles.priceComparison__featureList}>
                            {tableRows.map((row) => {
                                const isIncluded = row.included[activePlan.type] === true;
                                return (
                                    <li key={row.id} className={styles.priceComparison__featureItem}>
                                        <span className={styles.priceComparison__featureName}>
                                            {row.feature}
                                        </span>
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
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            ) : null}
        </section>
    );
}

export default PriceComparison;
