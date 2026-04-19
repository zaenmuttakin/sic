import { Suspense } from "react";
import EccList from "../../../components/datalist/EccList";

export default function Page() {
  return (
    <div className="bg-blue-100 min-h-screen">
      <Suspense fallback={<div>Loading Search...</div>}>
        <EccList />
      </Suspense>
    </div>
  );
}
