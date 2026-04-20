import { Suspense } from "react";
import EccList from "../../../components/datalist/EccList";
import { LoaderCircle } from "lucide-react";

export default function Page() {
  return (
    <div className="bg-indigo-100 min-h-screen">
      <Suspense
        fallback={
          <div className="w-full bg-white min-h-screen flex items-center justify-center py-10">
            <LoaderCircle size={40} className="animate-spin text-indigo-400" />
          </div>
        }
      >
        <EccList />
      </Suspense>
    </div>
  );
}
