// components/QRScanner.js

"use client";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";

const QRScanner = () => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(
      (decodedText) => {
        console.log("QR Code detected:", decodedText);
        // Handle successful scan
        handleScanSuccess(decodedText);
      },
      (error) => {
        // Handle scan failure
        console.log("QR Code scan error:", error);
      }
    );

    // Cleanup function
    return () => {
      scanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner.", error);
      });
    };
  }, []);

  const handleScanSuccess = (decodedText) => {
    // You can redirect, show modal, or process the data
    alert(`Scanned: ${decodedText}`);

    // Example: Redirect if it's a URL
    if (decodedText.startsWith("http")) {
      window.open(decodedText, "_blank");
    }
  };

  return (
    <div className="scanner-container">
      <h2>QR Code Scanner</h2>
      <div id="qr-reader" ref={scannerRef}></div>
    </div>
  );
};

export default QRScanner;
