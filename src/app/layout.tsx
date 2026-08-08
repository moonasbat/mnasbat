import type { Metadata, Viewport } from "next";
import { Tajawal, Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Script from "next/script";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/seo";
import AuthListener from "@/components/AuthListener";
import ThemeInit from "@/components/ThemeInit";
import NavigationProgress from "@/components/NavigationProgress";
import PwaInstall from "@/components/PwaInstall";
import AnnouncementBar from "@/components/AnnouncementBar";
import ReferralCapture from "@/components/ReferralCapture";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import FloatingAddAd from "@/components/FloatingAddAd";
import { createAdminClient } from "@/lib/supabase/admin";

export const viewport: Viewport = {
  themeColor: "#6D28D9",
};

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

async function getIntegrationSettings() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_settings")
    .select("key,value")
    .in("key", [
      "google_site_verification",
      "announcement_text",
      "announcement_link",
      "whatsapp_support_number",
      "gtm_container_id",
      "recaptcha_site_key",
    ]);
  const map: Record<string, string> = {};
  (data ?? []).forEach((r) => (map[r.key] = r.value));
  return map;
}

async function getAddonFlags() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("feature_flags")
    .select("key,enabled")
    .in("key", ["announcement_bar_enabled", "floating_whatsapp_enabled"]);
  const map: Record<string, boolean> = {};
  (data ?? []).forEach((r) => (map[r.key] = r.enabled));
  return map;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getIntegrationSettings();
  const title = `${SITE_NAME} — سوق إعلانات القاعات والحفلات والمناسبات في السعودية`;
  const description = SITE_DESCRIPTION;

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: { default: title, template: `%s — ${SITE_NAME}` },
    description,
    alternates: { canonical: "/" },
    icons: {
      icon: [{ url: "/icon", type: "image/png", sizes: "48x48" }],
      apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
    },
    openGraph: {
      type: "website",
      locale: "ar_SA",
      siteName: SITE_NAME,
      title,
      description,
      url: "/",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
    robots: { index: true, follow: true },
    verification: settings.google_site_verification ? { google: settings.google_site_verification } : undefined,
  };
}

function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon`,
    description: SITE_DESCRIPTION,
  };
}

function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "ar-SA",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, addonFlags] = await Promise.all([getIntegrationSettings(), getAddonFlags()]);
  const gtm = settings.gtm_container_id;
  const recaptchaSiteKey = settings.recaptcha_site_key;
  const showAnnouncement = addonFlags.announcement_bar_enabled && settings.announcement_text?.trim();
  const showFloatingWhatsapp = addonFlags.floating_whatsapp_enabled && settings.whatsapp_support_number?.trim();

  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${tajawal.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {gtm && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
              if (localStorage.getItem('theme') !== 'light') {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}`,
          }}
        />
        {gtm && (
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
          </Script>
        )}
        {recaptchaSiteKey && (
          <Script src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`} strategy="afterInteractive" />
        )}
        {showAnnouncement && <AnnouncementBar text={settings.announcement_text} link={settings.announcement_link || undefined} />}
        <ThemeInit />
        <Suspense>
          <NavigationProgress />
          <AuthListener />
          <ReferralCapture />
        </Suspense>
        {children}
        <PwaInstall />
        <FloatingAddAd />
        {showFloatingWhatsapp && <FloatingWhatsApp number={settings.whatsapp_support_number} />}
      </body>
    </html>
  );
}
