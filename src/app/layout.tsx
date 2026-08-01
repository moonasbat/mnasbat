import type { Metadata, Viewport } from "next";
import { Tajawal, Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Script from "next/script";
import AuthListener from "@/components/AuthListener";
import NavigationProgress from "@/components/NavigationProgress";
import PwaInstall from "@/components/PwaInstall";
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
    .in("key", ["ga4_measurement_id", "google_site_verification", "facebook_pixel_id", "tiktok_pixel_id"]);
  const map: Record<string, string> = {};
  (data ?? []).forEach((r) => (map[r.key] = r.value));
  return map;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getIntegrationSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
    title: "مناسبات — سوق إعلانات المناسبات",
    description: "كل ما يخص مناسبتك… في مكان واحد. أنشئ إعلانك أو اكتشف ما يناسبك.",
    verification: settings.google_site_verification ? { google: settings.google_site_verification } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getIntegrationSettings();
  const ga4 = settings.ga4_measurement_id;
  const fbPixel = settings.facebook_pixel_id;
  const tiktokPixel = settings.tiktok_pixel_id;

  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${tajawal.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
              var t = localStorage.getItem('theme');
              if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}`,
          }}
        />
        {ga4 && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga4}');`}
            </Script>
          </>
        )}
        {fbPixel && (
          <Script id="fb-pixel-init" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${fbPixel}');
fbq('track', 'PageView');`}
          </Script>
        )}
        {tiktokPixel && (
          <Script id="tiktok-pixel-init" strategy="afterInteractive">
            {`!function (w, d, t) {
w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
ttq.load('${tiktokPixel}');
ttq.page();
}(window, document, 'ttq');`}
          </Script>
        )}
        <Suspense>
          <NavigationProgress />
          <AuthListener />
        </Suspense>
        {children}
        <PwaInstall />
      </body>
    </html>
  );
}
