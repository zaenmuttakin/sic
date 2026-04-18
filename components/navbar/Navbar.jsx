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
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const activePath = pathname.split("/").slice(0, 3).join("/");

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

  return (
    <nav
      className={`fixed inset-x-0 bottom-4 z-50 flex justify-center transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-24"
      }`}
    >
      <div className="mx-4 flex items-center justify-center gap-4 rounded-full border border-white/80 bg-white/85 px-4 py-3 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activePath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex h-12 w-12 items-center justify-center rounded-full transition ${
                active
                  ? "bg-indigo-100 text-indigo-500"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={24} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
