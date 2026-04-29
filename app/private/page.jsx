"use client";
import Link from "next/link";
import {
  Archive,
  Package,
  Search,
  LayoutGrid,
  Zap,
  User,
  LogOut,
  PackagePlus,
  Package2,
  FileSpreadsheet,
  Users,
  ArrowRightLeft,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";


const MenuItem = ({ item, idx }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 * idx + 0.2 }}
    className="h-full"
  >
    <Link
      href={item.href}
      className="group flex flex-col h-full bg-white rounded-3xl p-5 shadow-lg shadow-slate-200/30 border border-white hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative mb-4 flex justify-center scale-90">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="transparent"
            className="text-slate-50"
          />
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            strokeDasharray="175.9"
            initial={{ strokeDashoffset: 175.9 }}
            animate={{
              strokeDashoffset: 175.9 - (175.9 * item.progress) / 100,
            }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="text-indigo-400"
          />
        </svg>
        <div
          className={`absolute inset-0 flex items-center justify-center ${item.color}`}
        >
          <item.icon size={26} />
        </div>
      </div>
      <div className="text-center mt-auto">
        <h3 className="text-base font-semibold text-gray-800 leading-tight group-hover:text-indigo-600 transition-colors">
          {item.title}
        </h3>
        <p className="text-[10px] text-slate-400 mt-1.5">{item.text}</p>
      </div>
    </Link>
  </motion.div>
);

export default function Home() {
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

  const menuItems = [
    {
      title: "ECC MID",
      icon: Package2,
      href: "/private/ecc",
      progress: 100,
      text: "SAP ECC DATA",
      color: "text-indigo-500",
    },
    {
      title: "Material Data",
      icon: Search,
      href: "/private/data",
      progress: 100,
      text: "S4HANA DATA",
      color: "text-indigo-500",
    },
    {
      title: "Storage Bin",
      icon: Archive,
      href: "/private/bin",
      progress: 100,
      text: "LOKASI AKTUAL",
      color: "text-indigo-500",
    },
    {
      title: "Account",
      icon: User,
      href: "/private/account",
      progress: 100,
      text: userData.nickname.toUpperCase(),
      color: "text-indigo-500",
    },
    {
      title: "Regist.",
      icon: PackagePlus,
      href: "/private/bin/regist",
      progress: 100,
      text: "FIXED BIN",
      color: "text-indigo-500",
      superOnly: false,
    },
    {
      title: "Export",
      icon: FileSpreadsheet,
      href: "/private/export",
      progress: 100,
      text: "EXCEL DATA",
      color: "text-indigo-500",
      superOnly: false,
    },
    {
      title: "Users",
      icon: Users,
      href: "/private/users",
      progress: 100,
      text: "MANAGE USERS",
      color: "text-indigo-500",
      superOnly: true,
    },
    {
      title: "Bin Transfer",
      icon: ArrowRightLeft,
      href: "/private/bintobin",
      progress: 100,
      text: "BIN TO BIN",
      color: "text-indigo-500",
      superOnly: true,
    },
  ].filter((item) => !item.superOnly || userData.role === "superuser");

  const [[page, direction], setPage] = useState([0, 0]);
  const itemsPerSlide = 6;
  const menuChunks = [];
  for (let i = 0; i < menuItems.length; i += itemsPerSlide) {
    menuChunks.push(menuItems.slice(i, i + itemsPerSlide));
  }

  const paginate = (newDirection) => {
    const nextSlide = page + newDirection;
    if (nextSlide >= 0 && nextSlide < menuChunks.length) {
      setPage([nextSlide, newDirection]);
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  };


  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-indigo-100">
      {/* Decorative Background Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-[15%] -right-25"
        >
          <Zap size={400} className="text-indigo-600 -rotate-12" />
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-6 pt-12 pb-24">
        {/* Header Section */}
        <header className="mb-6">
          <div className="flex items-start justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-slate-500 font-medium mb-1">
                Hello {userData.nickname}
              </p>
              <h1 className="text-3xl font-extrabold text-indigo-500 tracking-tight leading-tight">
                Manage Your <br />
                <span className="text-indigo-500">Inventory!</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 rounded-[20px] bg-white/30 backdrop-blur-xl px-4 py-2 text-xs text-slate-500 border border-white/40 hover:bg-red-500/10 hover:text-red-500 hover:border-red-200/50 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
              >
                <div className="p-1 rounded-lg bg-white/50 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                  <LogOut size={14} />
                </div>
                Logout
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex items-center justify-between"
          >
            <div className="flex gap-1.5">
              {menuChunks.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage([i, i > page ? 1 : -1])}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    page === i ? "w-6 bg-indigo-500" : "w-1.5 bg-indigo-200"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </header>

        <div className="relative overflow-hidden -mx-2 px-2 min-h-[540px]">

          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500;
                if (swipe && offset.x > 0) {
                  paginate(-1);
                } else if (swipe && offset.x < 0) {
                  paginate(1);
                }
              }}
              className="grid grid-cols-2 grid-rows-3 gap-4 h-full"
            >
              {menuChunks[page]?.map((item, idx) => (
                <MenuItem key={item.title} item={item} idx={idx} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>


      </div>
    </main>
  );
}
