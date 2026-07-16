'use client';

import { useState } from 'react';
import type { WhatWriteFaq as WhatWriteFaqType } from '@/types/WhatWriteFaq';
import styles from './Accordion.module.scss';

type AccordionProps = {
    items: WhatWriteFaqType[];
};

function Accordion({ items }: AccordionProps) {
    const [activeItem, setActiveItem] = useState<number | null>(null);

    const handleItemClick = (id: number) => {
        setActiveItem(activeItem === id ? null : id);
    };

    return (
        <ul className={styles.accordion} >
            {items.map(({ id, title, answer, color }) => (
                <li
                    key={id}
                    className={`${styles.accordion__item} ${activeItem === id ? styles.accordion__item_active : ''}`}
                    onClick={() => handleItemClick(id)}
                >
                    <div className={styles.accordion__header} style={{ background: color }}>
                        <h3 className={styles.accordion__title}>{title}</h3>
                        <span className={styles.accordion__icon} aria-hidden="true" />
                    </div>
                    <p className={styles.accordion__answer}>{answer}</p>
                </li>
            ))}
        </ul>
    );
}

export default Accordion;
