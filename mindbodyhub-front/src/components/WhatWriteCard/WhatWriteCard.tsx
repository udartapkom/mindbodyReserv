import styles from './WhatWriteCard.module.scss';
import { Icon } from "@/shared/ui/Icon";
import { WhatWrite } from "@/types/WhatWrite";

function WhatWriteCard({ title, description, icon, color }: Omit<WhatWrite, 'id'>) {
    return (
        <div className={styles.whatWriteCard} style={{ background: color }}>
            <h3 className={styles.whatWriteCard__title}>{title}</h3>
            <Icon name={icon} className={styles.whatWriteCard__icon} />
            <p className={styles.whatWriteCard__description}>
                {description}
            </p>
        </div>
    );
}

export default WhatWriteCard;