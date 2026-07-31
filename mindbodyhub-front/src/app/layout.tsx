import { AuthProvider } from "@/context/AuthContext";
import PwaRegister from "@/components/Pwa/PwaRegister";
import PwaPushSync from "@/components/Pwa/PwaPushSync";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "@/shared/config/fontawesome";
import "@/global/globals.scss";
import styles from "./layout.module.scss";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mindbodyhub.pro";

const GA_MEASUREMENT_ID = "G-Y1885LZS96";
const YANDEX_METRIKA_ID = 110318322;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MindBodyHub - психология здоровья и бизнеса",
    template: "%s | MindBodyHub",
  },
  description: "MindBodyHub — это пространство для самостоятельной работы с тревогой, выгоранием, отношениями и другими запросами. Мы даём рабочие инструменты психологии и поддержку, а не готовые ответы и быстрые обещания.",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "MindBodyHub",
    title: "MindBodyHub",
    description: "Психология здоровья и бизнеса",
    images: [
      {
        // Cache-bust so messengers re-fetch after logo update
        url: "/icons/og-image.png?v=20260727",
        width: 1200,
        height: 630,
        alt: "MindBodyHub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MindBodyHub",
    description: "Психология здоровья и бизнеса",
    images: ["/icons/og-image.png?v=20260727"],
  },
  appleWebApp: {
    capable: true,
    title: "MindBodyHub",
    statusBarStyle: "default",
  },
  applicationName: "MindBodyHub",
};

export const viewport: Viewport = {
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className={styles.body}>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_ID}', 'ym');

            ym(${YANDEX_METRIKA_ID}, 'init', {
              ssr:true,
              webvisor:true,
              clickmap:true,
              ecommerce:"dataLayer",
              referrer: document.referrer,
              url: location.href,
              accurateTrackBounce:true,
              trackLinks:true
            });
          `}
        </Script>
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${YANDEX_METRIKA_ID}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
        <AuthProvider>
          <PwaRegister />
          <PwaPushSync />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
