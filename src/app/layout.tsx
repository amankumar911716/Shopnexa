import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ea580c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Shopnexa Online Shopping Site @www.shopnexa.com",
  description: "Shopnexa Online Shopping Site @www.shopnexa.com - Shop the latest products at unbeatable prices. Browse electronics, fashion, home & furniture, and more with fast delivery and easy returns.",
  keywords: ["Shopnexa", "online shopping site", "e-commerce", "deals", "fashion", "electronics", "www.shopnexa.com"],
  authors: [{ name: "Aman Kumar" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shopnexa",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    type: "website",
    title: "Shopnexa Online Shopping Site @www.shopnexa.com",
    description: "Your one-stop destination for everything you need. Shop electronics, fashion, home & more.",
    siteName: "Shopnexa",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "application-name": "Shopnexa",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#ea580c" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
