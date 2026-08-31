import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ALIVER - Aile Alışveriş Asistanınız",
  description: "Ailenizle paylaşabileceğiniz akıllı alışveriş listesi uygulaması",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛒</text></svg>",
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
        className={`${inter.variable} antialiased bg-background text-foreground overflow-x-hidden`}
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#14213D',
              border: '1px solid rgba(252, 163, 17, 0.2)',
              color: '#FFFFFF',
            },
          }}
        />
      </body>
    </html>
  );
}
