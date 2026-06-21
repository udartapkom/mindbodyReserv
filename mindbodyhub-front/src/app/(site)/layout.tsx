import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import styles from "./layout.module.scss";

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main className={styles.main}>
                {children}
            </main>
            <Footer />
        </>
    );
}