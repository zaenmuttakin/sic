import { Suspense } from "react";
import DataList from "../../../components/datalist/DataList";
import { LoaderCircle } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="w-full bg-white min-h-screen flex items-center justify-center py-10">
            <LoaderCircle size={40} className="animate-spin text-indigo-400" />
          </div>
        }
      >
        <DataList />
      </Suspense>
    </div>
  );
}
