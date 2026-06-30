import styles from './WhatWrite.module.scss';
import WhatWriteCard from '../WhatWriteCard/WhatWriteCard';
import { whatData } from '@/content/WhatData';
import type { WhatWrite as WhatWriteType } from '@/types/WhatWrite';

function WhatWrite() {
    return (
        <section className={styles.whatWrite}>
            <div className={styles.whatWrite__container}>
                <h2 className={styles.whatWrite__title}>Когда писать в поддержку</h2>
                <div className={styles.whatWrite__content}>
                    {whatData.map((item: WhatWriteType) => (
                        <WhatWriteCard
                            key={item.id}
                            title={item.title}
                            description={item.description}
                            icon={item.icon}
                            color={item.color}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default WhatWrite;