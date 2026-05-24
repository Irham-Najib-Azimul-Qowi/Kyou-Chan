import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://najinkyou.dev"),
  title: { default: "Najin Kyou — Data Scientist & AI Engineer", template: "%s | Najin Kyou" },
  description: "Portfolio of Irham Najib Azimul Qowi (Najin Kyou), Software Engineering student focused on Data Science, AI, RAG, ML, and Computer Vision.",
  keywords: ["Najin Kyou", "Irham Najib Azimul Qowi", "Data Scientist", "AI Engineer", "RAG Pipeline", "Next.js Portfolio", "Computer Vision Madiun", "Politeknik Negeri Madiun"],
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  openGraph: { 
    title: "Najin Kyou — Data Scientist & AI Engineer", 
    description: "Sumi-e inspired portfolio featuring advanced AI agents, dynamic document RAG pipelines, on-device vision models, and fullstack apps.", 
    url: "https://najinkyou.dev", 
    siteName: "Najin Kyou", 
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "Najin Kyou Portfolio Cover"
      }
    ],
    locale: "en_US",
    type: "website" 
  },
  twitter: {
    card: "summary_large_image",
    title: "Najin Kyou — Data Scientist & AI Engineer",
    description: "AI pipelines and fullstack web portfolio.",
    images: ["/og"]
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Irham Najib Azimul Qowi",
  "alternateName": "Najin Kyou",
  "url": "https://najinkyou.dev",
  "image": "https://najinkyou.dev/og-image.png",
  "sameAs": [
    "https://github.com/irhamqowi",
    "https://linkedin.com/in/irham-najib"
  ],
  "jobTitle": "Data Scientist & AI Engineer",
  "worksFor": {
    "@type": "Organization",
    "name": "Politeknik Negeri Madiun"
  },
  "description": "Software Engineering student focused on Data Science, AI, RAG pipelines, on-device ML models, and high-quality web-mobile fullstack applications."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="antialiased scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-[var(--bg-deep)] text-[var(--text-primary)] relative">
        <ScrollProgress />
        <CustomCursor />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
