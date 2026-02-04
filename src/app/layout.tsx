import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalToastProvider } from "@/components/ToastProvider";
import { getThemeInitScript } from "@/utils/theme";
import { I18nProvider } from "@/components/I18nProvider";
import { getServerLocale } from "@/i18n/server";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spanish Notes App",
  description: "Learn Spanish with AI-powered interactive notes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Spanish Notes" />
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
      </head>
      <body className="antialiased">
        <GlobalToastProvider>
          <I18nProvider initialLocale={locale}>
            <ServiceWorkerRegistration />
            {children}
          </I18nProvider>
        </GlobalToastProvider>
      </body>
    </html>
  );
}
