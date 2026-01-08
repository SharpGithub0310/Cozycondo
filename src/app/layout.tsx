import type { Metadata } from "next";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import CriticalCSS from "@/components/CriticalCSS";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import ResourcePreloader from "@/components/ResourcePreloader";

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
        {/* Optimized font loading with display=swap and preload */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap"
        />
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
