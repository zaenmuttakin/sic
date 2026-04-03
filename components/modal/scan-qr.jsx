"use client";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import GrayBtn from "../button/gray-btn";
import QRScanner from "../qr/QRScanner";
import ContainerModal from "./container";

export default function ScanQr({
  isOpen,
  setIsOpen,
  setValue,
  setOpenSrcMaterial,
}) {
  const [isLoad, setisLoad] = useState(false);
  const [maximize, setMaximize] = useState(false);
  return (
    <ContainerModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      maximize={maximize}
      setMaximize={setMaximize}
      align="top"
    >
      <div className="flex items-center justify-between pt-4 px-6">
        <p className="font-semibold">Scan QR</p>
        <GrayBtn
          type="submit"
          style="bg-white w-10"
          onClick={() => {
            setIsOpen(false);
          }}
          disabled={isLoad}
          label={
            <FontAwesomeIcon icon={faTimes} className="text-lg text-gray-500" />
          }
        />
      </div>
      <div className="p-4 pb-12">
        <QRScanner
          endScanAct={(e) => {
            setValue(e);
            setTimeout(() => {
              setOpenSrcMaterial(true);
              setIsOpen(false);
            }, 200);
          }}
        />
      </div>
    </ContainerModal>
  );
}
