import type { Metadata } from "next";
import { Bangers, Space_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
  display: "swap",
});
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});
const dmSans = DM_Sans({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Future Creatives — Own the culture you believe in",
  description:
    "A decentralised creative economy. Crowd-commission, fractionally own and back the culture, arts and entertainment you want to exist.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bangers.variable} ${spaceMono.variable} ${dmSans.variable}`}>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
