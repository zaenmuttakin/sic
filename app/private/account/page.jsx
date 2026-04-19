"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  LogOut,
  ArrowLeft,
  ShieldCheck,
  LayoutGrid,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

export default function Account() {
  const router = useRouter();

  const [userData, setUserData] = useState({
    nik: "...",
    fullname: "Loading...",
    nickname: "...",
    bio: "Tetap fokus! akurasi adalah tujuan utama.",
    photo: "/def-profile.jpg",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("sic_user");
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    localStorage.removeItem("sic_user");
    router.push("/");
  };

  return (
    <main className="mesh-gradient-container w-full min-h-screen bg-slate-100 flex flex-col items-center justify-start p-4 py-8">
      <div className="mesh-blob top-[20%] -right-[20%] w-[110%] h-[70%] bg-indigo-200/40" />
      <div className="mesh-blob bottom-[-10%] left-[10%] w-[70%] h-[50%] bg-blue-100/30" />

      {/* Back Button - Compact */}
      <div className="w-full max-w-2xl">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-slate-200/40 overflow-hidden"
      >
        {/* Top Profile Image - More Compact Aspect */}
        <div className="p-3 pb-0">
          <div className="aspect-[1.1/1] rounded-2xl overflow-hidden bg-slate-50">
            <img
              src={userData.photo || "/def-profile.jpg"}
              alt={userData.fullname}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/def-profile.jpg";
              }}
            />
          </div>
        </div>

        {/* Content Section - Reduced Padding */}
        <div className="p-6 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              {userData.fullname}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 mb-6">
            <span className="text-sm font-semibold bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-md tracking-wider uppercase">
              @{userData.nickname?.toLowerCase() || "user"}
            </span>
            <span className="text-sm font-semibold bg-slate-50 text-slate-400 px-2 py-0.5 rounded-md tracking-wider uppercase">
              NIK: {userData.nik}
            </span>
          </div>

          <p className="text-sm text-slate-500 mb-6">
            Tetap fokus! Akurasi adalah tujuan utama.
          </p>

          <div className="flex items-center justify-end border-t border-slate-50 pt-5">
            <Link
              href="/"
              onClick={handleLogout}
              className="group flex items-center gap-2 rounded-[20px] bg-indigo-500 backdrop-blur-xl px-4 py-2 text-sm text-white border-white/40 hover:bg-indigo-500/10 hover:text-indigo-500 hover:border-indigo-200/50 transition-all duration-300 hover:shadow-md active:scale-95"
            >
              <span className="p-1 rounded-lg text-indigo-100 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                <LogOut size={14} />
              </span>
              Logout
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
