// components/QRGenerator.js
import { toCanvas } from "qrcode";
import { useState } from "react";

const QRGenerator = () => {
  const [text, setText] = useState("");
  const [qrCode, setQrCode] = useState("");

  const generateQR = async () => {
    if (!text.trim()) return;

    try {
      const canvas = document.createElement("canvas");
      await toCanvas(canvas, text, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCode(canvas.toDataURL());
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = qrCode;
    link.click();
  };

  return (
    <div className="generator-container">
      <h2>Generate QR Code</h2>

      <div className="generator-form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text or URL to generate QR code"
          className="text-input"
          rows="4"
        />
        <button
          onClick={generateQR}
          className="generate-btn"
          disabled={!text.trim()}
        >
          Generate QR Code
        </button>
      </div>

      {qrCode && (
        <div className="qr-result">
          <img src={qrCode} alt="Generated QR Code" className="qr-image" />
          <button onClick={downloadQR} className="download-btn">
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;
