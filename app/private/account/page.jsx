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
      {/* Header Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200 hover:text-red-500 hover:border-red-300"
        >
          <LogOut size={16} />
          Logout
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
        </div>
      </motion.div>
    </main>
  );
}
