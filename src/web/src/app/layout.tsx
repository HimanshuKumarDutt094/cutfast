import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://cutfast-extension.vercel.app"),
  title: "CutFast - Smart Text Shortcuts",
  description:
    "Boost your productivity with intelligent text shortcuts. Create, manage, and use custom shortcuts across all your favorite apps and websites.",
  keywords: [
    "text shortcuts",
    "productivity",
    "automation",
    "text expansion",
    "keyboard shortcuts",
  ],
  authors: [{ name: "Himanshu Kumar Dutt" }],
  creator: "Himanshu Kumar Dutt",
  publisher: "Himanshu Kumar Dutt",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: [
    { rel: "icon", url: "/cutfast-16.png", sizes: "16x16", type: "image/png" },
    { rel: "icon", url: "/cutfast-32.png", sizes: "32x32", type: "image/png" },
    { rel: "icon", url: "/cutfast-48.png", sizes: "48x48", type: "image/png" },
    {
      rel: "icon",
      url: "/cutfast-128.png",
      sizes: "128x128",
      type: "image/png",
    },
    { rel: "apple-touch-icon", url: "/cutfast-128.png", sizes: "128x128" },
  ],
  manifest: "/manifest.json",
  openGraph: {
    title: "CutFast - Smart Text Shortcuts",
    description:
      "Boost your productivity with intelligent text shortcuts. Create, manage, and use custom shortcuts across all your favorite apps and websites.",
    url: "https://cutfast-extension.vercel.app",
    siteName: "CutFast",
    images: [
      {
        url: "/home-landing.jpeg",
        width: 1200,
        height: 630,
        alt: "CutFast Home Landing Page - Smart Text Shortcuts",
      },
      {
        url: "/dashboard-page.jpeg",
        width: 1200,
        height: 630,
        alt: "CutFast Dashboard - Manage Your Shortcuts",
      },
      {
        url: "/cutfast.png",
        width: 512,
        height: 512,
        alt: "CutFast Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CutFast - Smart Text Shortcuts",
    description:
      "Boost your productivity with intelligent text shortcuts. Create, manage, and use custom shortcuts across all your favorite apps and websites.",
    images: ["/home-landing.jpeg", "/dashboard-page.jpeg", "/cutfast.png"],
    creator: "@cutfast",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

// JSON-LD structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'CutFast - Smart Text Shortcuts',
  description: 'Boost your productivity with intelligent text shortcuts. Create, manage, and use custom shortcuts across all your favorite apps and websites.',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Person',
    name: 'Himanshu Kumar Dutt',
  },
  screenshot: [
    'https://cutfast-extension.vercel.app/home-landing.jpeg',
    'https://cutfast-extension.vercel.app/dashboard-page.jpeg',
    'https://cutfast-extension.vercel.app/create-a-shortcut.png',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    ratingCount: '1',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body>
        <NuqsAdapter>
          <Toaster />
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
