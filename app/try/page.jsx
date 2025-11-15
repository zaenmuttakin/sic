// pages/index.js
"use client";
import { useState } from "react";
import QRScanner from "../../components/qr/QRScanner";

export default function Home() {
  const [activeTab, setActiveTab] = useState("scan");

  return (
    <div className="container">
      <header className="header">
        <h1>QR Code App</h1>
        <nav className="tabs">
          <button
            className={`tab ${activeTab === "scan" ? "active" : ""}`}
            onClick={() => setActiveTab("scan")}
          >
            Scan QR
          </button>
          <button
            className={`tab ${activeTab === "generate" ? "active" : ""}`}
            onClick={() => setActiveTab("generate")}
          >
            Generate QR
          </button>
        </nav>
      </header>

      <main className="main-content">
        {/* {activeTab === "scan" ? <QRScanner /> : <QRGenerator />}
         */}
        <QRScanner />
      </main>
    </div>
  );
}
