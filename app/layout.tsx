import type React from "react";
import type { Metadata } from "next";
import { Marcellus_SC, Figtree, Bangers } from "next/font/google";
import { Suspense } from "react";
import CustomCursor from "@/components/CustomCursor";
import "./globals.css";

const marcellusSC = Marcellus_SC({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marcellus",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
});

export const metadata: Metadata = {
  title: "Keertan K - Portfolio",
  description: "Portfolio website for Keertan K",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
        />
      </head>
      <body
        className={`${marcellusSC.variable} ${figtree.variable} ${bangers.variable} antialiased`}
      >
        <CustomCursor />
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  );
}
