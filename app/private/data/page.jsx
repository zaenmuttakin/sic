import { Suspense } from "react";
import DataList from "../../../components/datalist/DataList";

export default function Page() {
  return (
    <div className="bg-indigo-100 min-h-screen">
      <Suspense fallback={<div>Loading Search...</div>}>
        <DataList />
      </Suspense>
    </div>
  );
}
