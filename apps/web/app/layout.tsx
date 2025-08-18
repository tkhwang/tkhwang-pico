import "@copilotkit/react-ui/styles.css";
import "./globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/providers/auth-provider";
import Navbar05Page from "@/components/navbar-05/navbar-05";
import { CopilotKit } from "@copilotkit/react-core";
import { getConfig } from "@/lib/config";

const config = getConfig();

export const metadata: Metadata = {
  metadataBase: new URL(config.common.webUrl),
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
        <CopilotKit
          publicLicenseKey={config.copilotKit.publicLicenseKey}
          runtimeUrl={config.mastra.copilotKitUrl}
          agent="weatherAgent"
        >
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
