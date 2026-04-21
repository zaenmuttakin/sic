"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UndoProvider } from "@/context/UndoContext";

export default function PrivateLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem("sic_user");
      if (!savedUser) {
        router.replace("/");
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (!isAuthenticated) {
    // Show a minimal loading state while checking authentication
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return <UndoProvider>{children}</UndoProvider>;
}
