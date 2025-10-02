import type React from "react";
import type { Metadata } from "next";
import { Marcellus_SC, Figtree, Bangers, Covered_By_Your_Grace } from "next/font/google";
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

const coveredByYourGrace = Covered_By_Your_Grace({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-covered",
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
        className={`${marcellusSC.variable} ${figtree.variable} ${bangers.variable} ${coveredByYourGrace.variable} antialiased`}
      >
        <CustomCursor />
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  );
}
