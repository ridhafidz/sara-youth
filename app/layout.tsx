import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SARA — SDGs Accountability and Risk Analytics",
  description:
    "Dashboard pemantauan program SDGs mahasiswa: impact score, monitoring jadwal, aktivitas, dan distribusi program per Goal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--sara-bg)]">{children}</body>
    </html>
  );
}
