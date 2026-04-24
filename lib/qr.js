"use client";
import { useState, useCallback, useEffect } from "react";

/**
 * Reusable Hook for QR Scanning using html5-qrcode
 * Designed for cross-device compatibility (iOS, Android, Desktop)
 *
 * Error philosophy: NEVER throw — always setError() and return.
 * This prevents console errors and app crashes on devices without cameras.
 */
export function useQrScanner() {
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);

  const stopScanner = useCallback(async (activeScanner) => {
    const s = activeScanner || scanner;
    if (s) {
      try {
        await s.stop();
        s.clear();
      } catch {
        // Silently ignore — scanner may already be stopped
      }
    }
    setScanner(null);
    setIsScanning(false);
    setIsInitializing(false);
  }, [scanner]);

  const startScanner = useCallback(async (elementId, onScanSuccess) => {
    // Guard against double-initialization
    if (isInitializing) return;

    setError(null);
    setIsInitializing(true);

    // --- Pre-flight checks (set error + return, never throw) ---

    // 1. HTTPS check — cameras require secure context
    const isSecure =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isSecure) {
      setError("Camera requires a secure connection (HTTPS). Please access this page via HTTPS.");
      setIsInitializing(false);
      return;
    }

    // 2. Browser API check
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser doesn't support camera access. Please try Chrome, Safari, or Firefox.");
      setIsInitializing(false);
      return;
    }

    // 3. Cleanup any previous scanner
    if (scanner) {
      await stopScanner();
    }

    // --- Attempt camera start ---
    let Html5Qrcode;
    try {
      const mod = await import("html5-qrcode");
      Html5Qrcode = mod.Html5Qrcode;
    } catch {
      setError("Failed to load scanner module. Please check your internet connection and try again.");
      setIsInitializing(false);
      return;
    }

    const html5QrCode = new Html5Qrcode(elementId);

    const config = {
      fps: 10,
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.floor(minEdge * 0.7);
        return { width: qrboxSize, height: qrboxSize };
      },
      aspectRatio: 1.0,
    };

    const handleScan = async (decodedText) => {
      onScanSuccess(decodedText);
      try {
        await html5QrCode.stop();
        html5QrCode.clear();
      } catch {
        // Ignore cleanup errors
      }
      setScanner(null);
      setIsScanning(false);
    };

    // Strategy: Try environment camera → fallback to any camera → inform user
    let started = false;

    // Attempt 1: Back/environment camera (preferred on mobile)
    if (!started) {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          handleScan,
          () => {}
        );
        started = true;
      } catch {
        // Will try fallback next
      }
    }

    // Attempt 2: Enumerate devices and try first available
    if (!started) {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          await html5QrCode.start(devices[0].id, config, handleScan, () => {});
          started = true;
        }
      } catch {
        // Will set error below
      }
    }

    // --- Result ---
    if (started) {
      setScanner(html5QrCode);
      setIsScanning(true);
    } else {
      // Clean up the failed instance
      try { html5QrCode.clear(); } catch { /* ignore */ }
      setError("No camera available on this device. You can type the bin name manually instead.");
    }

    setIsInitializing(false);
  }, [scanner, stopScanner, isInitializing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanner) {
        try { scanner.stop(); scanner.clear(); } catch { /* ignore */ }
      }
    };
  }, [scanner]);

  return { startScanner, stopScanner, isScanning, isInitializing, error };
}
