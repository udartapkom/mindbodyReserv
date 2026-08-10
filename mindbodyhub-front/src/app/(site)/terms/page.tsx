import { terms } from '@/content/terms';
import styles from './page.module.scss';
import Link from 'next/link';

function TermsPage() {
    return (
        <main className={styles.terms}>
            <Link href="/">Главная</Link>
            <h1>Пользовательское соглашение</h1>
            <p>{terms.date}</p>
            <div>
                {terms.sections.map((section) => (
                    <div key={section.title}>
                        <h2>{section.title}</h2>
                        {section.content.map((paragraph, index) => (
                            <p key={`${section.title}-${index}`}>{paragraph}</p>
                        ))}
                    </div>
                ))}
            </div>
        </main>
    );
}

export default TermsPage;