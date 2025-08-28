import "@copilotkit/react-ui/styles.css";
import "./globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { getConfig } from "@/lib/config";
import { ClerkProvider } from "@clerk/nextjs";

const config = getConfig();

export const metadata: Metadata = {
  metadataBase: new URL(config.common.webUrl),
  title: "PICO | Personal Intelligence Copilot",
  description: "Your everyday AI to search, plan, and get things done.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ClerkProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ClerkProvider>
            <Toaster position="bottom-right" richColors />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
