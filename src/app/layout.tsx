import type { Metadata, Viewport } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import DeepLinkListener from '@/components/aliver/deep-link-listener'
import PushNotificationListener from '@/components/aliver/push-notification-listener'

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ALIVER - Aile Alışveriş Asistanınız",
  description: "ALIVER - Aile Alışveriş Asistanınız",
  icons: {
    icon: "/aliver-favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${mono.variable} antialiased bg-background text-foreground overflow-x-hidden`}
      >
        <DeepLinkListener />
        <PushNotificationListener />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'Outfit, system-ui, sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}
