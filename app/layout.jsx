import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Poppins } from "next/font/google";
import DynamicMetaTags from "../components/metatag/DynamicMetaTags";
import Toast from "../components/toast/toast";
import { AuthProvider } from "../lib/context/auth";
import { MaterialDataProvider } from "../lib/context/material-data";
import { ToastProvider } from "../lib/context/toast";
import { ColorProvider } from "../lib/context/topbar-color";
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
  description: "Sparepart Inventory Control App",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["Inventory", "WMS", "SIC", "Sparepart"],
  icons: [
    { rel: "apple-touch-icon", url: "icon-192x192.png" },
    { rel: "icon", url: "icon-192x192.png" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <body className={`${poppins.variable} antialiased`}>
      <AuthProvider>
        <ColorProvider>
          <MaterialDataProvider>
            <ToastProvider>
              <DynamicMetaTags />
              <Toast />
              {children}
            </ToastProvider>
          </MaterialDataProvider>
        </ColorProvider>
      </AuthProvider>
    </body>
  );
}
