import styles from './page.module.scss';
import AuthFlow from '@/components/Auth/AuthFlow';

function LoginPage() {
    return (
        <section className={styles.loginPage}>
            <h1 className={styles.loginPage__title}>MindBodyHub</h1>
            <AuthFlow />
        </section>
    );
}

export default LoginPage;