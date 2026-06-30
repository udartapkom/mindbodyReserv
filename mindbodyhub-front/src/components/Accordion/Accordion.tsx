'use client';

import { useState } from 'react';
import type { WhatWriteFaq as WhatWriteFaqType } from '@/types/WhatWriteFaq';
import styles from './Accordion.module.scss';
import { Icon } from '@/shared/ui/Icon';

type AccordionProps = {
    items: WhatWriteFaqType[];
};

function Accordion({ items }: AccordionProps) {
    const [activeItem, setActiveItem] = useState<number | null>(null);

    const handleClick = (id: number) => {
        setActiveItem((current) => (current === id ? null : id));
    };

    return (
        <div className={styles.accordion}>
            {items.map(({ id, title, answer, color }) => {
                const isActive = activeItem === id;

                return (
                    <div
                        key={id}
                        className={`${styles.accordion__item} ${isActive ? styles.accordion__item_active : ''}`}
                        onClick={() => handleClick(id)}
                    >
                        <div className={styles.accordion__header} style={{ background: color }}>
                            <h3 className={styles.accordion__title}>{title}</h3>
                            <Icon
                                name="chevron-down"
                                className={`${styles.accordion__icon} ${isActive ? styles.accordion__icon_active : ''}`}
                            />
                        </div>
                        <p
                            className={`${styles.accordion__answer} ${isActive ? styles.accordion__answer_active : ''}`}
                        >
                            {answer}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

export default Accordion;
