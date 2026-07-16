import AvatarField from '@/components/Cabinet/AvatarField/AvatarField';
import styles from './page.module.scss';

export default function CabinetProfilePage() {
    return (
        <section>
            <h1>Настройки профиля</h1>
            <p>Здесь вы можете изменить свои данные и настройки аккаунта.</p>
            <form className={styles.profile__form}>
                <div className={styles.profile__formGroup}>
                    <label htmlFor="name" className={styles.profile__formGroupLabel}>Имя</label>
                    <input type="text" id="name" name="name" className={styles.profile__formGroupInput} />
                </div>

                <AvatarField />

                <div className={styles.profile__formGroup}>
                    <label htmlFor="phone" className={styles.profile__formGroupLabel}>Телефон</label>
                    <input type="tel" id="phone" name="phone" className={styles.profile__formGroupInput} />
                </div>
            </form>
            
            <h3>Изменить пароль</h3>
            <form className={styles.profile__form}>
            <div className={styles.profile__formGroup}>
                <label htmlFor="password" className={styles.profile__formGroupLabel}>Старый пароль</label>
                <input type="password" id="oldPassword" name="oldPassword" className={styles.profile__formGroupInput} />
            </div>
            <div className={styles.profile__formGroup}>
                <label htmlFor="password" className={styles.profile__formGroupLabel}>Новаый пароль</label>
                <input type="password" id="password" name="password" className={styles.profile__formGroupInput} />
            </div>
            <div className={styles.profile__formGroup}>
                <label htmlFor="confirmPassword" className={styles.profile__formGroupLabel}>Подтвердите пароль</label>
                <input type="password" id="confirmPassword" name="confirmPassword" className={styles.profile__formGroupInput} />
            </div>
            </form>
        </section>
    );
}
