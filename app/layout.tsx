import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteUrl } from "../lib/siteConfig";

export const metadata: Metadata = {
  title: "Sahan Kumar — AI & ML Student, Developer & Builder",
  description:
    "Portfolio of Sahan Kumar, an AI & ML student, developer and builder exploring artificial intelligence, machine learning, web development, systems and creative technology.",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "Sahan Kumar — AI & ML Student, Developer & Builder",
    description:
      "Portfolio of Sahan Kumar, an AI & ML student, developer and builder exploring artificial intelligence, machine learning, web development, systems and creative technology.",
    url: siteUrl,
    siteName: "Sahan Kumar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {
    google: "gSax0EgDO6qsi_7jnCgDI8Uz4gy1FDUkIXD0UwivGtA",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Sahan Kumar",
    url: siteUrl,
    jobTitle: "AI & ML Student / Developer",
    description:
      "Portfolio of Sahan Kumar, an AI & ML student, developer and builder exploring artificial intelligence, machine learning, web development, systems and creative technology.",
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
