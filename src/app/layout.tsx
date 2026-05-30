import type { Metadata } from "next";
import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InforMed — Fácil acceso a tu historial clínico",
  description:
    "Timeline de eventos clínicos entre hospitales locales, respaldado por Arkiv (Braga).",
  icons: {
    icon: "/logo-icon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${plusJakarta.variable} ${geistMono.variable} min-h-screen bg-med-primary text-med-text antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
