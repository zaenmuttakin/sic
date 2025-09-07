"use client";
import { faFaceSadCry } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PrimaryBtn from "../../components/button/primary-btn";
export default function Page() {
  const router = useRouter();
  return (
    <div className="page-container a-middle bg-[#E8ECF7]">
      {/* <FontAwesomeIcon icon- */}
      <div className="mb-10 relative">
        <Image src={"/logo-icon.svg"} width={90} height={90} alt="logo" />
        <FontAwesomeIcon
          icon={faFaceSadCry}
          className="absolute text-[2.7rem] p-.5 py-1 text-[#6460ff] bg-[#E8ECF7] rounded-full -right-4 bottom-0"
        />
      </div>
      <p className="text-xl font-semibold text-gray-800">
        Fitur belum tersedia
      </p>
      <p className="text-gray-500 mt-2 px-8 my-10 text-center text-sm">
        Sabar ya, masih proses nih. Coba fitur yang lain dulu
      </p>
      <PrimaryBtn
        type="submit"
        label="Back to home"
        onClick={() => router.push("/private")}
      />
    </div>
  );
}
