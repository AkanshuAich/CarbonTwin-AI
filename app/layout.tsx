import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "CarbonTwin AI — See Your Future Impact",
    template: "%s | CarbonTwin AI",
  },
  description:
    "CarbonTwin AI creates your Digital Carbon Twin to help you understand and reduce your environmental impact through intelligent simulations and AI-powered insights.",
  keywords: [
    "carbon footprint",
    "sustainability",
    "climate change",
    "carbon twin",
    "AI",
    "environmental impact",
  ],
  authors: [{ name: "CarbonTwin AI" }],
  openGraph: {
    type: "website",
    title: "CarbonTwin AI",
    description: "See the environmental impact of your future before making a decision.",
    siteName: "CarbonTwin AI",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f0d" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable} data-scroll-behavior="smooth">
      <body className="bg-background text-foreground antialiased">
        {/* Skip to main content — keyboard accessibility (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-white focus:font-medium focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
