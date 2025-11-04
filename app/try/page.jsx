"use client";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

const dataArray = ["01", "02", "03", "04", "05", "06", "07"];

export default function IPhoneTimerScroll() {
  const [index, setIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up"); // "up" or "down"
  const touchStartY = useRef(0);
  const scrollTimeout = useRef(null);
  const hasScrolled = useRef(false);

  const handleValueChange = useCallback(
    (direction) => {
      setIndex((prev) => {
        const next = Math.max(
          0,
          Math.min(dataArray.length - 1, prev + direction)
        );
        return next;
      });
      setIsScrolling(true);
      setScrollDirection(direction > 0 ? "up" : "down");

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 100);
    },
    [dataArray.length]
  );

  const handleWheel = (e) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? -1 : 1;
    handleValueChange(direction);
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    setIsScrolling(true);
    hasScrolled.current = false;
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!touchStartY.current || hasScrolled.current) return;

    const touchY = e.touches[0].clientY;
    const deltaY = touchStartY.current - touchY;

    if (Math.abs(deltaY) > 40 && !hasScrolled.current) {
      const direction = deltaY > 0 ? 1 : -1;
      handleValueChange(direction);
      hasScrolled.current = true;
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = 0;
    hasScrolled.current = false;
    setTimeout(() => setIsScrolling(false), 100);
  };

  const handleDecrement = () => handleValueChange(-1);
  const handleIncrement = () => handleValueChange(1);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className=" rounded-3xl w-fit">
        <div className="relative flex flex-col items-center">
          {/* Top Control Button (Chevron Up) */}
          <motion.button
            className={`w-12 h-12 bg-gray-50 text-black rounded-full flex items-center justify-center hover:bg-gray-700 active:bg-gray-600 mb-2 transition-opacity duration-200 ${
              index === dataArray.length - 1
                ? "opacity-30 pointer-events-none"
                : ""
            }`}
            whileTap={{ scale: 0.9 }}
            onClick={handleIncrement}
            disabled={index === dataArray.length - 1}
            aria-label="Increment"
          >
            {/* Chevron Up SVG */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </motion.button>

          {/* Main Value Display */}
          <div
            className="relative flex items-center justify-center"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: "none" }}
          >
            <div className="relative bg-gray-10 rounded-2xl w-18 h-18 flex items-center justify-center">
              <motion.div
                className="absolute -top-1/2 inset-0 rounded-2xl opacity-50"
                animate={{
                  scale: isScrolling ? 1.02 : 1,
                }}
                transition={{ duration: 0.1 }}
              />

              <div className="relative z-10 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={dataArray[index]}
                    initial={
                      scrollDirection === "up"
                        ? { y: 60, opacity: 0 }
                        : { y: -60, opacity: 0 }
                    }
                    animate={{ y: 0, opacity: 1 }}
                    exit={
                      scrollDirection === "up"
                        ? { y: -60, opacity: 0 }
                        : { y: 60, opacity: 0 }
                    }
                    transition={{ duration: 0.1 }}
                    className="text-black text-4xl font-light text-center tracking-tight"
                  >
                    {dataArray[index]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            {/* Top and Bottom Fades */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>

          {/* Bottom Control Button (Chevron Down) */}
          <motion.button
            className={`w-12 h-12 bg-gray-50 text-black rounded-full flex items-center justify-center hover:bg-gray-700 active:bg-gray-600 mt-2 transition-opacity duration-200 ${
              index === 0 ? "opacity-30 pointer-events-none" : ""
            }`}
            whileTap={{ scale: 0.9 }}
            onClick={handleDecrement}
            disabled={index === 0}
            aria-label="Decrement"
          >
            {/* Chevron Down SVG */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
