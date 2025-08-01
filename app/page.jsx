"use client";
import { useRouter } from "next/navigation";
import Inputz from "../components/input/input";
import PrimaryBtn from "../components/button/primary-btn";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex h-screen items-center justify-center px-12">
      <form className="flex flex-col gap-4 max-w-xs w-full">
        <Inputz type="number" placeholder="Username" />
        <Inputz type="password" placeholder="Password" />
        <PrimaryBtn
          type="submit"
          label="Login"
          onClick={(e) => {
            e.preventDefault();
            router.push("/private");
          }}
        />
      </form>
    </div>
  );
}
