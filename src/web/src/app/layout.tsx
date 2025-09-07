import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://cutfast.app"),
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
    url: "https://cutfast.app",
    siteName: "CutFast",
    images: [
      {
        url: "/cutfast.png",
        width: 1200,
        height: 630,
        alt: "CutFast - Smart Text Shortcuts",
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
    images: ["/cutfast.png"],
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <NuqsAdapter>
          <Toaster/>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
