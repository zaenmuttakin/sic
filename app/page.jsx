"use client";
import { ChevronRight, LayoutGrid, Search } from "lucide-react";
import { useState } from "react";
import Navbar from "../components/navbar/Navbar";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center ">
     <a href="/private">Go to Private Page</a>
    </main>
  );
}
