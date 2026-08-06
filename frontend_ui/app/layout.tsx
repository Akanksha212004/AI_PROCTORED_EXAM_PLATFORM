import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider } from "@/hooks/useI18n";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "ProctorEd | AI-Proctored Examination Platform",
  description: "Secure, AI-proctored online examinations for institutions.",
  applicationName: "ProctorEd",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ProctorEd",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      // { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0B2135",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
        <I18nProvider>
          <AuthProvider>
            <ServiceWorkerRegister />
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: "#0B2135",
                  color: "#E6F3FC",
                  border: "1px solid #1E4A66",
                  fontFamily: "var(--font-inter)",
                  fontSize: "14px",
                },
                success: { iconTheme: { primary: "#14B8A6", secondary: "#0B2135" } },
                error: { iconTheme: { primary: "#EF4444", secondary: "#0B2135" } },
              }}
            />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
