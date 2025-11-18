import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Weitsprung Bewertung - RadDWB",
  description: "Moderne Web-App zur Genauigkeitsmessung im Weitsprung in der Schule EF. Berechnung von Sprint, Sprung, Reproduzierbarkeit und Treffgenauigkeit.",
  keywords: "Weitsprung, Bewertung, Schule, Sport, EF, Genauigkeitsmessung",
  authors: [{ name: "RadDWB" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
  openGraph: {
    title: "Sprungapp - Weitsprung & Hochsprung Bewertung",
    description: "Moderne Web-App zur Bewertung von Weitsprung und Hochsprung nach NRW-Tabellen",
    images: [
      {
        url: "/Sprungapp_logo.jpg",
        width: 1200,
        height: 600,
        alt: "Sprungapp Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sprungapp - Weitsprung & Hochsprung Bewertung",
    description: "Moderne Web-App zur Bewertung von Weitsprung und Hochsprung nach NRW-Tabellen",
    images: ["/Sprungapp_logo.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
