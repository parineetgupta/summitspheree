import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-cormorant" });

export const metadata: Metadata = {
  title: "SummitSphere",
  description: "A premium documentary experience of the greatest expeditions on earth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} ${cormorant.variable} font-sans`}>
        <AuthProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  );
}
