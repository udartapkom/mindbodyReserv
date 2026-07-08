import { AuthGuard } from "@/utils/AuthGuard";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import CabinetNav from "@/components/Cabinet/CabinetNav/CabinetNav";
import styles from "./layout.module.scss";

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <AuthGuard>
                    <CabinetNav />
                    {children}
                </AuthGuard>
            </main>
            <Footer />
        </>
    );
}