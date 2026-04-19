import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";
import Navbar from "../components/navbar/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "SIC - S4",
  description: "Sparepart Inventory Control System",
  manifest: "/site.webmanifest",
};

export const viewport = {
  themeColor: "#e0e7ff",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          {children}</Providers>
      </body>
    </html>
  );
}
