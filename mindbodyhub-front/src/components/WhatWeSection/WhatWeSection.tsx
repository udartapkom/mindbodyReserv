import styles from './WhatWeSection.module.scss';
import WhatWeCard from '../WhatWeCard/WhatWeCard';
import { WhatWeCard as WhatWeCardContent } from '@/content/WhatWeCard';

function WhatWeSection() {
    return (
        <section className={styles.whatWeSection}>
            <div className={styles.whatWeSection__container}>
                <h2 className={styles.whatWeSection__title}>Почему мы</h2>
                <div className={styles.whatWeSection__cards}>
                    {WhatWeCardContent.map((card) => (
                        <WhatWeCard key={card.id} {...card} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default WhatWeSection;