"use client";
import { useState } from "react";
import ScanQr from "../../components/modal/scan-qr";

export default function page() {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <ScanQr isOpen={open} setIsOpen={setOpen} />
    </div>
  );
}
