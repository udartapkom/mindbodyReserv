const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mindbodyhub.pro";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MindBodyHub",
  url: siteUrl,
  logo: `${siteUrl}/icons/og-image.png`,
  description:
    "Онлайн-пространство для самостоятельной работы с тревогой, выгоранием, отношениями и другими психологическими запросами.",
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MindBodyHub",
  url: siteUrl,
  inLanguage: "ru-RU",
  publisher: {
    "@type": "Organization",
    name: "MindBodyHub",
    url: siteUrl,
  },
};

function SiteJsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}

export default SiteJsonLd;
