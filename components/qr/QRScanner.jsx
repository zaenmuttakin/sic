"use client";
import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";

export default function QRScanner({ endScanAct }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("Loading...");
  const [scanCount, setScanCount] = useState(0);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const scanAttemptsRef = useRef(0);
  const lastResultRef = useRef("");

  // Pre-initialize camera for faster startup
  useEffect(() => {
    // Pre-warm the camera access
    const preWarmCamera = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (error) {
        // Silent fail - just pre-warming
      }
    };

    preWarmCamera();
    !streamRef.current ? startScanner() : null;
  }, []);

  useEffect(() => {
    result && stopScanner();
    result && endScanAct(result);
  }, [result]);

  const startScanner = async () => {
    try {
      setStatus("Starting camera...");
      setResult("");
      scanAttemptsRef.current = 0;

      // Stop any existing stream quickly
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }

      // Minimal constraints for fastest startup
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 }, // Lower resolution for speed
          height: { ideal: 640 },
          frameRate: { ideal: 24 }, // Lower frame rate for performance
        },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      // Don't wait for metadata - start scanning immediately
      setStatus("Scanning...");

      // Start scanning immediately without waiting for video to fully load
      scanFrame();
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    // Quick check if video has some data
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      // Only update canvas size when absolutely necessary
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Fast draw without quality concerns
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      scanAttemptsRef.current++;

      // Smart scanning: Only scan every 3rd frame for performance
      if (scanAttemptsRef.current % 3 === 0) {
        // Scan smaller center area (50% instead of 70%)
        const scanSize = Math.min(canvas.width, canvas.height) * 0.5;
        const startX = (canvas.width - scanSize) / 2;
        const startY = (canvas.height - scanSize) / 2;

        const imageData = context.getImageData(
          startX,
          startY,
          scanSize,
          scanSize
        );

        // Fast QR detection with minimal options
        const code = jsQR(
          imageData.data,
          imageData.width,
          imageData.height,
          { inversionAttempts: "dontInvert" } // Faster with single attempt
        );

        if (code && code.data !== lastResultRef.current) {
          lastResultRef.current = code.data;
          setResult(code.data);
          setScanCount((prev) => prev + 1);
          setStatus("✓ QR Found!");

          // Quick status reset
          setTimeout(() => {
            if (status === "✓ QR Found!") {
              setStatus("Scanning...");
            }
          }, 1000);
        }
      }

      // Update status less frequently for performance
      if (scanAttemptsRef.current % 20 === 0) {
        setStatus(`Scanning... ${scanAttemptsRef.current}`);
      }
    }

    // Continue with next frame immediately
    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const stopScanner = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      // Fast track stopping
      const tracks = streamRef.current.getTracks();
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].stop();
      }
      streamRef.current = null;
    }

    setStatus("Ready");
    scanAttemptsRef.current = 0;
  };

  const resetResult = () => {
    setResult("");
    lastResultRef.current = "";
    setStatus("Scanning...");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setStatus("✓ Copied!");
    setTimeout(() => setStatus("Scanning..."), 800);
  };

  // Fast cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto">
      {/* Camera Preview */}
      <div className="relative mb-3">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="bg-black rounded-2xl"
          style={{
            width: "280px",
            height: "280px", // Slightly smaller for performance
            objectFit: "cover",
          }}
        />

        {/* Lightweight Guide Border */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute border-2 border-indigo-500 rounded-xl"
            style={{
              top: "15%",
              left: "15%",
              width: "70%",
              height: "70%",
            }}
          />
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {/* Minimal Status */}
      <div className="w-full mt-3 a-middle">
        <div
          className={` text-xs px-4 py-2 rounded-full w-fit ${
            status.includes("✓")
              ? "text-gray-500 bg-gray-100"
              : status.includes("Error")
              ? "text-red-500 bg-red-100"
              : "text-indigo-500 bg-indigo-50"
          }`}
        >
          {status}
        </div>
        {result && (
          <div className="text-xs text-gray-500 mt-1">
            Scanned: {scanCount} | Attempts: {scanAttemptsRef.current}
          </div>
        )}
      </div>

      {/* Compact Controls */}
      {/* <div className="flex gap-2 justify-center mb-3">
        {!streamRef.current ? (
          <button
            onClick={startScanner}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
          >
            Start Scan
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
          >
            Stop
          </button>
        )}

        {result && (
          <button
            onClick={resetResult}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
          >
            Clear
          </button>
        )}
      </div> */}

      {/* Fast Result Display
      {result && (
        <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg animate-pulse">
          <div className="bg-white p-2 rounded border break-words">
            <p className="text-green-700 text-sm font-mono">{result}</p>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs"
            >
              Copy
            </button>
            {result.startsWith("http") && (
              <button
                onClick={() => window.open(result, "_blank")}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-1 px-2 rounded text-xs"
              >
                Open
              </button>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
}
