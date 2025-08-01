"use client";
import React, { useState } from "react";

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);
  return (
    <div className="flex h-screen items-start justify-center w-full">
      <div className="flex flex-col gap-4 w-full max-w-2xl px-6"></div>
    </div>
  );
}
