import type { Metadata } from "next";
import { Tajawal, Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import AuthListener from "@/components/AuthListener";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "مناسبات — سوق إعلانات المناسبات",
  description: "كل ما يخص مناسبتك… في مكان واحد. أنشئ إعلانك أو اكتشف ما يناسبك.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense>
          <AuthListener />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
