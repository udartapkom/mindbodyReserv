import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/shared/config/fontawesome";
import "@/global/globals.scss";
import styles from "./layout.module.scss";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mindbodyhub.pro";

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
  description: "Психология здоровья и бизнеса",
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
        url: "/icons/og-image.png",
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
    images: ["/icons/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className={styles.body}>{children}</body>
    </html>
  );
}
