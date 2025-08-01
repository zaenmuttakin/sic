import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  style: ["normal", "italic"],
  preload: true,
  adjustFontFallback: true,
  fallbackWeight: "400",
  fallbackStyle: "normal",
  fallbackDisplay: "swap",
  fallbackSubsets: ["latin"],
  fallbackVariable: "--font-poppins-fallback",
  fallbackFontFamily: "system-ui, sans-serif",
  fallbackFontStyle: "normal",
  fallbackFontWeight: "400",
  fallbackFontSize: "1rem",
  fallbackLineHeight: "1.5",
  fallbackLetterSpacing: "normal",
  fallbackTextTransform: "none",
  fallbackFontFeatureSettings: "normal",
});

export const metadata = {
  title: "SIC - Central",
  description: "Sparepart Inventory Control",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>{children}</body>
    </html>
  );
}
