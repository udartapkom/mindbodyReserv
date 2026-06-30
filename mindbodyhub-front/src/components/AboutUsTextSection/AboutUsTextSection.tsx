import styles from './AboutUsTextSection.module.scss';

function AboutUsTextSection() {
    return (
        <section className={styles.aboutUsTextSection}>
            <div className={styles.aboutUsTextSection__container}>
                <h2 className={styles.aboutUsTextSection__title}>Как всё начиналось</h2>

                <p className={styles.aboutUsTextSection__text}>
                    <strong>MindBodyHub</strong> появился из простой мысли: человек способен
                    разбираться со своими запросами сам — если рядом есть понятные инструменты,
                    структура и люди, которые не осуждают. Мы видели, как часто люди ищут
                    не «готовый ответ», а опору: где начать, как выбрать тему, как работать
                    с тревогой, выгоранием или отношениями без давления и спешки.
                </p>

                <p className={styles.aboutUsTextSection__text}>
                    Сначала это было закрытое пространство для обмена опытом и разборов
                    реальных ситуаций. Постепенно к живым историям добавились системные
                    методики психологии, материалы по психологии здоровья и практические
                    инструменты для работы и бизнеса — всё в одном месте, в удобном темпе.
                </p>

                <h3 className={styles.aboutUsTextSection__subtitle}>MindBodyHub сегодня</h3>

                <p className={styles.aboutUsTextSection__text}>
                    Сегодня MindBodyHub — это онлайн-платформа для самостоятельной работы
                    над собой: форум, база знаний и пространство, где можно найти тему,
                    изучить материалы и двигаться дальше с поддержкой сообщества.
                    Мы не обещаем быстрых решений — мы создаём среду, в которой изменения
                    действительно возможны.
                </p>

                <p className={styles.aboutUsTextSection__text}>
                    Если вы только знакомитесь с проектом — начните с раздела поддержки
                    или посмотрите, как устроена работа на платформе. Мы продолжаем
                    развивать MindBodyHub, чтобы психология здоровья и бизнеса была
                    доступнее, понятнее и ближе к реальной жизни.
                </p>
            </div>
        </section>
    );
}

export default AboutUsTextSection;