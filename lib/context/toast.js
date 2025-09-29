"use client";

import { createContext, useEffect, useMemo, useState } from "react";

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toastData, setToastData] = useState({
    open: false,
    type: "success",
    text: "This is a toast notification message",
    autoHide: false,
  });

  const setToast = ({ open, type, text, autoHide }) => {
    closeToast();
    setTimeout(
      () =>
        setToastData({
          open,
          type,
          text,
          autoHide,
        }),
      300
    );
  };
  const closeToast = () => {
    setToastData({
      open: false,
      type: "success",
      text: "This is a toast notification message",
      autoHide: false,
    });
  };

  useEffect(() => {
    if (toastData.open && toastData.autoHide) {
      setTimeout(() => closeToast(), 5000);
    }
  }, [toastData]);

  const toastProviderValue = useMemo(() => ({
    toastData,
    setToast,
    closeToast,
  }));

  return (
    <ToastContext.Provider value={toastProviderValue}>
      {children}
    </ToastContext.Provider>
  );
};
