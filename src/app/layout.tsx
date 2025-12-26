import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MessengerWidget from "@/components/MessengerWidget";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import PerformanceDisplay from "@/components/PerformanceDisplay";
import CriticalCSS from "@/components/CriticalCSS";
import AnalyticsTracker from "@/components/AnalyticsTracker";

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
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.supabase.co" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />
      </head>
      <body className="font-body antialiased bg-[#fefdfb] text-[#5f4a38]">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <MessengerWidget />
        <PerformanceMonitor />
        <PerformanceDisplay />
        <CriticalCSS />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
