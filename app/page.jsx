"use client";
import Cookies from "js-cookie";
import Image from "next/image";
import { useContext, useState } from "react";
import GrayBtn from "../components/button/gray-btn";
import PrimaryBtn from "../components/button/primary-btn";
import Inputz from "../components/input/input";
import { AuthContext } from "../lib/context/auth";
import { ToastContext } from "../lib/context/toast";

export default function Home() {
  const [nik, setNik] = useState("");
  const [pass, setPass] = useState("");
  const [cekval, setCekval] = useState(false);
  const { login } = useContext(AuthContext);
  const { setToast, closeToast } = useContext(ToastContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast({
      open: true,
      text: "Verifying...",
    });
    const loginData = await login(new Number(nik), pass);
    closeToast();
    !loginData.success &&
      setToast({
        open: true,
        text: loginData.response || "Terjadi kesalahan, coba lagi",
        type: "error",
      });
    if (loginData.success) {
      setToast({
        open: true,
        text: "Wait a moment",
      });
      const token = Cookies.get("token");
      token && window.location.reload();
    }
  };

  const handleGuest = async (paramNik, paramPass) => {
    setToast({
      open: true,
      text: "Verifying...",
    });
    const loginData = await login(new Number(paramNik), paramPass);
    !loginData.success &&
      setToast({
        open: true,
        text: "Terjadi kesalahan, coba lagi",
        type: "error",
        autoHide: true,
      });
    if (loginData.success) {
      setToast({
        open: true,
        text: "Wait a moment",
      });
      const token = Cookies.get("token");
      token && window.location.reload();
    }
  };

  return (
    <div className="flex h-screen items-center justify-center px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setCekval(true);
          nik && pass
            ? handleSubmit(e)
            : setToast({
                open: true,
                type: "error",
                text: "NIK & Password wajib diisi",
              });
        }}
        className="flex flex-col gap-4 max-w-md w-full px-6 lg:px-8 py-10 bg-white rounded-3xl"
      >
        <div className="w-full a-middle mb-8 pt-2">
          <Image src={"/sic-icon.svg"} alt="Logo" width={175} height={175} />
        </div>

        <Inputz
          type="number"
          placeholder="NIK"
          value={nik}
          style={cekval && !nik && "cekval"}
          onChange={(e) => setNik(e.target.value)}
        />
        <Inputz
          type="password"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={cekval && !pass && "cekval"}
        />
        <PrimaryBtn type="submit" label="Masuk" style="mt-3" />
        <GrayBtn
          type="button"
          label="Masuk Sebagai Tamu"
          onClick={() => handleGuest("111111", "12345678")}
        />

        {/* <p className="text-center text-gray-500 text-sm mt-4 lg:mt-6">
          Belum punya akun?{" "}
          <a href="http://" className="text-blue-500">
            Daftar
          </a>
        </p> */}
      </form>
    </div>
  );
}
