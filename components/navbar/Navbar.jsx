"use client";
import { LayoutGrid, Package, MapPinSearchIcon, Search, Archive } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { href: "/private", icon: LayoutGrid },
  { href: "/private/bin", icon: Archive },
  { href: "/private/ecc", icon: Package },
  { href: "/private/data", icon: Search },
];

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [showVignette, setShowVignette] = useState(true);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const activePath = pathname.split("/").slice(0, 3).join("/");
  
  const isHidden =
    pathname === "/" ||
    pathname === "/private/account" ||
    pathname.includes("/detail/");
  
  useEffect(() => {
    activePath == "/private" ? setShowVignette(false) : setShowVignette(true);
  }, [pathname]);

  const themeColor = "indigo";

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isHidden) return null;

  return (
    <>
      {showVignette && (
        <div 
          className={`fixed inset-x-0 bottom-0 z-40 h-15 pointer-events-none bg-gradient-to-t ${
            themeColor === 'blue' ? 'from-blue-100 via-blue-100/60' : 'from-indigo-100 via-indigo-100/60'
          } to-transparent transition-transform duration-300 ease-in-out ${
            isVisible ? "translate-y-0" : "translate-y-full"
          }`} 
        />
      )}
      <nav
        className={`fixed inset-x-0 bottom-4 z-50 flex justify-center transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "translate-y-24"
        }`}
      >
        <div className={`mx-4 flex items-center justify-center gap-4 rounded-full border border-white/80 bg-white/85 px-4 py-3 shadow-slate-900/5 backdrop-blur-xl ${showVignette ? "shadow-xl" : ""}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex h-12 w-12 items-center justify-center rounded-full transition ${
                  active
                    ? themeColor === 'blue' 
                      ? "bg-blue-100 text-blue-600" 
                      : "bg-indigo-100 text-indigo-500"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={24} />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
