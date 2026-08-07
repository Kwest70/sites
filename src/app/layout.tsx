import type { Metadata } from "next";
import { Bangers, DM_Sans, Space_Mono } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

const bangers = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-utility",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Future Creatives — Shape the culture you want to experience",
  description:
    "A decentralised creative economy. Crowd commissioning, fractional ownership and community governance for culture, the arts and entertainment.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${bangers.variable} ${spaceMono.variable} ${dmSans.variable}`}
      >
        <SiteNav />
        <div className="page-in">{children}</div>
        <footer className="foot">
          <div className="wrap">
            <span>Future Creatives</span>
            <span>A Hip Hop Story — 25 years in 2028</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
