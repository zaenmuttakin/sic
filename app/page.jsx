"use client";
import { useRouter } from "next/navigation";
import Inputz from "../components/input/input";
import PrimaryBtn from "../components/button/primary-btn";
import GrayBtn from "../components/button/gray-btn";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex h-screen items-center justify-center px-4">
      <form className="flex flex-col gap-4 max-w-md w-full px-6 lg:px-8 py-10 bg-white rounded-3xl">
        <div className="w-full a-middle mb-8 pt-2">
          <Image src={"/sic-icon.svg"} alt="Logo" width={175} height={175} />
        </div>

        <Inputz type="email" placeholder="Email" />
        <Inputz type="password" placeholder="Password" style="mb-3" />
        <PrimaryBtn
          type="submit"
          label="Sign In"
          onClick={(e) => {
            e.preventDefault();
            router.push("/private");
          }}
        />
        <GrayBtn
          type="submit"
          label="Sign in with Google"
          image={true}
          imgsrc="/google.svg"
          onClick={(e) => {
            e.preventDefault();
            router.push("/private");
          }}
        />
        <p className="text-center text-gray-500 text-sm mt-4 lg:mt-6">
          Belum punya akun?{" "}
          <a href="http://" className="text-blue-500">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}
