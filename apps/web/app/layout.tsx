import "@copilotkit/react-ui/styles.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/providers/auth-provider";
import "./globals.css";
import Navbar05Page from "@/components/navbar-05/navbar-05";
import { CopilotKit } from "@copilotkit/react-core";
import { getCommonConfig } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(getCommonConfig().webUrl),
  title: "PICO | Personal Intelligence Companion Operator",
  description: "PICO is a personal intelligence companion operator",
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
        <CopilotKit runtimeUrl="/api/copilotkit" agent="weatherAgent">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <Navbar05Page />
              {children}
            </AuthProvider>
          </ThemeProvider>
        </CopilotKit>
      </body>
    </html>
  );
}
