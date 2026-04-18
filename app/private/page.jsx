"use client";
import Link from "next/link";
import { Archive, ChevronRight, Package, Search, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-4xl w-full">
        <div className="overflow-hidden rounded-3xl  border-slate-200/70 bg-white/95 p-6 ">
          <div className="mb-8">
            <div className="flex gap-4 text-sm font-semibold uppercase tracking-[0.30em] text-indigo-500">
              <Zap /> SIC CENTRAL
            </div>
            <h1 className="mt-12 text-2xl font-semibold text-slate-900">
              Tetap fokus!
            </h1>
            <p className="max-w-2xl  leading-6 text-slate-600">
              Akurasi adalah tujuan utama 🔥
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 grid-cols-2">
            <Link
              href="/private/ecc"
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg/10"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-500">
                  <Package size={24} />
                </div>
              </div>
              <div className="mt-4 flex-1">
                <h2 className="text-xl font-semibold text-slate-900">
                  ECC MID
                </h2>
              </div>
              <div className="mt-4 flex items-center gap-2 text-indigo-500 font-semibold">
                <span>Buka</span>
                <ChevronRight size={16} />
              </div>
            </Link>

            <Link
              href="/private/data"
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg/10"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-500">
                  <Search size={24} />
                </div>
              </div>
              <div className="mt-4 flex-1">
                <h2 className="text-xl font-semibold text-slate-900">
                  Material Data
                </h2>
              </div>
              <div className="mt-4 flex items-center gap-2 text-indigo-500 font-semibold">
                <span>Buka</span>
                <ChevronRight size={16} />
              </div>
            </Link>

            <Link
              href="/private/bin"
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg/10"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-500">
                  <Archive size={24} />
                </div>
              </div>
              <div className="mt-4 flex-1">
                <h2 className="text-xl font-semibold text-slate-900">
                  Storage Bin
                </h2>
              </div>
              <div className="mt-4 flex items-center gap-2 text-indigo-400 font-semibold">
                <span>Buka</span>
                <ChevronRight size={16} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
