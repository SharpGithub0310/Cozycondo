import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import CriticalCSS from "@/components/CriticalCSS";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import ResourcePreloader from "@/components/ResourcePreloader";

// Self-hosted fonts via next/font (no external requests)
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cozy Condo - Premium Short-Term Rentals in Iloilo City",
    template: "%s | Cozy Condo",
  },
  description: "Discover comfortable and convenient short-term rental condominiums in Iloilo City, Philippines. Modern amenities, prime locations, and exceptional hospitality.",
  keywords: ["Iloilo City", "condo rental", "short-term rental", "Airbnb", "Philippines", "accommodation", "vacation rental"],
  authors: [{ name: "Cozy Condo" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    siteName: "Cozy Condo Iloilo City",
    title: "Cozy Condo - Premium Short-Term Rentals in Iloilo City",
    description: "Discover comfortable and convenient short-term rental condominiums in Iloilo City, Philippines.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${outfit.variable} ${playfair.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://api.supabase.co" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />
      </head>
      <body className="font-body antialiased bg-[#fefdfb] text-[#5f4a38]">
        <ResourcePreloader />
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        <CriticalCSS />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
