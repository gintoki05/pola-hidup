import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cek GGL — Kalkulator Gula, Garam & Lemak Harian",
  description:
    "Pantau konsumsi gula, garam, dan lemak harianmu sesuai anjuran Kemenkes (Permenkes No. 30 Tahun 2013).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full dark`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
