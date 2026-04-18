import { Suspense } from "react";
import EccList from "../../../components/datalist/EccList";

export default function Page() {
  return (
    <div className="bg-indigo-50 min-h-screen">
      <Suspense fallback={<div>Loading Search...</div>}>
        <EccList />
      </Suspense>
    </div>
  );
}
