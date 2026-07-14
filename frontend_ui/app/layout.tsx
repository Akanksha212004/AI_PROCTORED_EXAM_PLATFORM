import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "@/hooks/useAuth";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "ProctorEd | AI-Proctored Examination Platform",
  description: "Secure, AI-proctored online examinations for institutions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
        <AuthProvider>
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
      </body>
    </html>
  );
}
