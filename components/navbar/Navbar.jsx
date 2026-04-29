"use client";
import {
  LayoutGrid,
  Package,
  MapPinSearchIcon,
  Search,
  Archive,
  History,
  Package2,
  Bot,
  Sparkle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navItems = [
  {
    href: "/private",
    icon: LayoutGrid,
    active: "bg-indigo-100 text-indigo-500",
    inactive: "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600",
  },
  {
    href: "/private/bin",
    icon: Archive,
    active: "bg-indigo-100 text-indigo-500",
    inactive: "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600",
  },
  {
    href: "/private/ecc",
    icon: Package2,
    active: "bg-indigo-100 text-indigo-500",
    inactive: "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600",
  },
  {
    href: "/private/data",
    icon: Search,
    active: "bg-indigo-100 text-indigo-500",
    inactive: "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600",
  },
  {
    href: "/private/ai",
    icon: Sparkle,
    active: "bg-indigo-100 text-indigo-500",
    inactive: "text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600",
  },
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
    pathname === "/private/users" ||
    pathname === "/private/bintobin" ||
    pathname === "/private/ai" ||
    pathname.includes("/detail/") ||
    pathname.includes("/bin/") ||
    pathname.includes("/regist") ||
    pathname.includes("/export") ||
    pathname.includes("/data/image/") ||
    pathname.includes("/adding/");

  useEffect(() => {
    setShowVignette(true);
  }, [pathname]);

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
          className={`fixed inset-x-0 bottom-0 z-40 h-15 pointer-events-none bg-gradient-to-t from-indigo-100 via-indigo-100/60 to-transparent transition-transform duration-300 ease-in-out ${
            isVisible ? "translate-y-0" : "translate-y-full"
          }`}
        />
      )}
      <nav
        className={`fixed inset-x-0 bottom-4 z-50 flex justify-center transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "translate-y-24"
        }`}
      >
        <div
          className={`mx-4 flex items-center justify-center gap-1 rounded-full border border-white/80 bg-white/85 p-2 shadow-slate-900/5 backdrop-blur-xl ${showVignette ? "shadow-xl" : ""}`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${
                  active ? `${item.active} shadow-sm scale-110` : item.inactive
                }`}
              >
                <Icon size={22} />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
