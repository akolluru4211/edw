import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Edworld Co. — AI-Powered Career Platform for Students & Professionals",
    template: "%s | Edworld Co."
  },
  description: "Launch your career with Edworld Co. — India's #1 AI-powered career platform. Build ATS-proof portfolios, practice mock interviews with AI, get personalized career coaching, discover internships & jobs, and connect with a global student network. Free for students.",
  keywords: [
    "Edworld Co", "edworld.co.in", "AI career platform", "student career development",
    "AI career coach", "mock interview practice", "resume builder", "ATS resume scanner",
    "portfolio builder", "student networking", "internship finder", "job portal India",
    "campus ambassador program", "career readiness score", "AI mentoring",
    "student jobs", " fresher jobs India", "campus recruitment", "tech careers",
    "B.Tech placement", "engineering placement", "MCA placement", "BCA placement",
    "campus hiring", "campus placement preparation", "coding interview prep",
    "behavioral interview questions", "STAR method", "resume optimization",
    "LinkedIn profile optimization", "personal branding students",
    "developer portfolio", "open source contributions", "hackathon preparation",
    "startup jobs", "remote internships", "work from home internships India",
    "edtech platform", "career guidance students India", "placement preparation",
    "online career coaching", "AI resume review", "digital career card",
    "professional networking students", "alumni network", "mentor matching",
    "skill assessment", "career readiness", "job application tracker"
  ],
  authors: [{ name: "Edworld Co.", url: "https://edworld.co.in" }],
  creator: "Edworld Co.",
  publisher: "Edworld Co.",
  metadataBase: new URL("https://edworld.co.in"),
  alternates: {
    canonical: "https://edworld.co.in",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://edworld.co.in",
    siteName: "Edworld Co.",
    title: "Edworld Co. — AI-Powered Career Platform for Students",
    description: "Build ATS-proof portfolios, practice AI mock interviews, get career coaching, and discover opportunities. India's #1 AI career platform for students.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Edworld Co. — AI Career Platform",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Edworld Co. — AI-Powered Career Platform",
    description: "Build portfolios, practice interviews, get AI coaching. India's #1 career platform for students.",
    images: ["/og-image.png"],
    creator: "@edworldco",
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
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#0ea5e9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Edworld Co." />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <link rel="canonical" href="https://edworld.co.in" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Edworld Co.",
              "url": "https://edworld.co.in",
              "description": "AI-powered career platform for students — build portfolios, practice interviews, get career coaching.",
              "applicationCategory": "EducationApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              },
              "creator": {
                "@type": "Organization",
                "name": "Edworld Co.",
                "url": "https://edworld.co.in"
              }
            })
          }}
        />
      </head>
      <body className="h-full bg-slate-50 text-slate-900 font-sans">
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
