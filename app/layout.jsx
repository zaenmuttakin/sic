import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Poppins } from "next/font/google";
import { MaterialDataProvider } from "../lib/context/material-data";
import "./globals.css";
config.autoAddCss = false;

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata = {
  title: "SIC Central",
  description: "Sparepart Inventory Control",
  display: "fullscreen",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#E8ECF7" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#E8ECF7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="msapplication-navbutton-color" content="#E8ECF7" />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        <MaterialDataProvider>{children}</MaterialDataProvider>
      </body>
    </html>
  );
}
