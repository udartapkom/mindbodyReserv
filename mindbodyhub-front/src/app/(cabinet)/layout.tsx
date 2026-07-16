import { AuthGuard } from "@/utils/AuthGuard";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import CabinetNav from "@/components/Cabinet/CabinetNav/CabinetNav";
import UserBar from "@/components/Cabinet/UserBar/UserBar";
import styles from "./layout.module.scss";

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <AuthGuard>
                    <div className={styles.userBar}>
                        <UserBar />
                    </div>
                    <div className={styles.cabinetNav}>
                        <CabinetNav />
                    </div>
                    <div className={styles.content}>
                        {children}
                    </div>
                </AuthGuard>
            </main>
            <Footer />
        </>
    );
}