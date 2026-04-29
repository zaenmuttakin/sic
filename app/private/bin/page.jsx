import { Suspense } from "react";
import BinList from "@/components/datalist/BinList";

export const metadata = {
  title: "Bin Management - SIC",
  description: "Manage and view inventory bins",
};

export default function BinPage() {
  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        }
      >
        <BinList />
      </Suspense>
    </main>
  );
}
