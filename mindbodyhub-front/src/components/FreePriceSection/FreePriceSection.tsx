/**
 * Этот компонент не используется ибо только сбивает с толку!.
 * Он сохранен здесь для "если вдруг понадобится."
 */



import styles from "./FreePriceSection.module.scss";
import Image from "next/image";

function FreePriceSection() {
    return (
        <section className={styles.freePriceSection}>
{/*             <Image 
                src="/images/braintoform.png" 
                alt="Free Price Section" 
                width={100} height={100} 
                className={styles.freePriceSection__brainToForm}
                /> */}
                <div className={styles.freePriceSection__card}>
                    <div className={styles.freePriceSection__cardContent}>
                        <h3 className={styles.freePriceSection__cardTitle}>Базовый доступ</h3>
                        <p className={styles.freePriceSection__cardDescription}>
                            Бесплатный доступ к закрытому пространству 
                            <span className={styles.freePriceSection__cardDescriptionSpan}>&nbsp;MindBodyHub</span>
                        </p>
                        <p className={styles.freePriceSection__cardPrice}>Доступно после регистрации</p>
                        <button className={styles.freePriceSection__cardButton}>Регистрация</button>
                    </div>
                    <div className={styles.freePriceSection__cardList}>
                        <h4 className={styles.freePriceSection__cardListTitle}>Что входит:</h4>
                        <ul className={styles.freePriceSection__cardListItems}>
                            <li className={styles.freePriceSection__cardListItem}>
                                <p className={styles.freePriceSection__cardListItemTitle}>
                                    Доступ к закрытому пространству
                                </p>
                            </li>
                            <li className={styles.freePriceSection__cardListItem}>
                                <p className={styles.freePriceSection__cardListItemTitle}>
                                    Доступ к закрытому пространству
                                </p>
                            </li>
                            <li className={styles.freePriceSection__cardListItem}>
                                <p className={styles.freePriceSection__cardListItemTitle}>
                                    Доступ к закрытому пространству
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
        </section>
    );
}

export default FreePriceSection;