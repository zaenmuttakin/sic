"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { User, Lock, Eye, EyeOff, Zap, LogIn } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ nik: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      router.push("/private");
    }, 1500);
  };

  return (
    <main className="mesh-gradient-container min-h-screen bg-white flex items-center justify-center p-6 overflow-hidden">
      <div className="mesh-blob top-[20%] -right-[20%] w-[110%] h-[70%] bg-indigo-200/70" />
      <div className="mesh-blob top-[45%] -left-[20%] w-[90%] h-[60%] bg-blue-100/60" />
      <div className="mesh-blob bottom-[-10%] left-[10%] w-[70%] h-[50%] bg-violet-100/50" />

      {/* Decorative Background Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-[20%] -right-25"
        >
          <Zap size={400} className="text-indigo-600 -rotate-12" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Floating Card Animation removed */}
        <motion.div className="bg-white/60 backdrop-blur-3xl rounded-3xl p-8 shadow-[0_24px_48px_-12px_rgba(79,70,229,0.12)] border border-white">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                damping: 12,
                stiffness: 200,
                delay: 0.2,
              }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-[20px] bg-gradient-to-br from-indigo-400 to-indigo-500 text-white mb-6 shadow-xl shadow-indigo-200/40 relative group"
            >
              <div className="absolute inset-0 rounded-[20px] bg-indigo-400 blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              <Zap size={24} fill="white" className="relative z-10" />
            </motion.div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1.5">
              SIC Central
            </h1>
            <p className="text-[11px] text-slate-400 uppercase">
              Sparepart Inventory Control
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NIK Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors duration-300">
                  <User size={16} strokeWidth={2.5} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="NIK Number"
                  className="w-full bg-white/40 border border-gray-300 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all duration-300 "
                  value={formData.nik}
                  onChange={(e) =>
                    setFormData({ ...formData, nik: e.target.value })
                  }
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors duration-300">
                  <Lock size={16} strokeWidth={2.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/40 border border-gray-300 rounded-2xl py-3.5 pl-12 pr-12 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all duration-300"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-indigo-500 transition-colors duration-300"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={2.5} />
                  ) : (
                    <Eye size={18} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              disabled={isLoading}
              type="submit"
              className="w-full group relative flex items-center justify-center bg-indigo-400 hover:bg-indigo-500 text-white rounded-2xl py-4 text-xs font-black tracking-widest uppercase shadow-xl shadow-indigo-100 transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden mt-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {isLoading ? (
                <div className="relative z-10 h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <div className="relative z-10 flex items-center gap-2">
                  <span>Login</span>
                </div>
              )}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-10"
          >
            <p className="text-[12px] text-slate-300 ">
              Login dengan NIK dan password "1234"
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}
