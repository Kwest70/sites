import type { Metadata } from "next";
import { Bangers, Space_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const bangers = Bangers({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-utility",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Future Creatives — Shape Culture, Arts & Entertainment",
  description:
    "A decentralized creative economy platform. Fractionally own culture. Commission projects. Shape the future of arts and entertainment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bangers.variable} ${spaceMono.variable} ${dmSans.variable} antialiased`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
