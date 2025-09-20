import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/Theme/theme-provider";
import { DataRefreshProvider } from "@/components/data-refresh-provider";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Trello AI Assistant - Powered by Vercel AI SDK & OpenAI",
  description:
    "An AI-powered Trello management assistant built with Vercel AI SDK and OpenAI",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} font-sans antialiased`}>
      <body>
        <ThemeProvider defaultTheme="system">
          <DataRefreshProvider>{children}</DataRefreshProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
