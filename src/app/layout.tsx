import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalToastProvider } from "@/components/ToastProvider";
import { getThemeInitScript } from "@/utils/theme";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
      </head>
      <body className="antialiased">
        <GlobalToastProvider>
          {children}
        </GlobalToastProvider>
      </body>
    </html>
  );
}
