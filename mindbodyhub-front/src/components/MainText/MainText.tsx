import styles from './MainText.module.scss';

function MainText() {
    return (
        <section className={styles.mainText} aria-labelledby="home-main-title">
            <article className={styles.mainText__article}>
                <h2 id="home-main-title" className={styles.mainText__title}>
                    Пространство для самостоятельной работы
                </h2>
                <p className={styles.mainText__text}> 
                    <span className={styles.mainText__span}>MindBodyHub</span> — это не каталог готовых ответов 
                    и не очередная «волшебная таблетка» для сложных состояний. 
                    Здесь собраны проверенные инструменты психологии и психиатрии, 
                    рабочие методики и живое пространство для самостоятельной работы над собой: 
                    с тревогой, выгоранием, отношениями, самооценкой и другими запросами.
                </p>
                <p className={styles.mainText__text}>
                    <span className={styles.mainText__span}>Ты</span>  сам выбираешь тему, с которой хочешь разобраться.
                    Находишь проблему — работаешь с ней в своём темпе — двигаешься дальше. 
                    Мы создаём условия, в которых эта работа действительно возможна: 
                    понятная структура, доступ к материалам и поддержка, когда она нужна. 
                    Без давления и без обещаний «исцелить за один вечер».
                </p>
                <p className={styles.mainText__text}>
                    Остальное — <span className={styles.mainText__span}>за тобой</span>. 
                    Но если ты ищешь место, 
                    где психологи и психиатры помогают не заменить тебя, 
                    а дать опору для реальных изменений — здесь есть с чем работать. 
                    И с чего начать.
                </p>
            </article>
        </section>
    )
}

export default MainText;