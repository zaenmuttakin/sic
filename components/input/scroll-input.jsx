"use client";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

export default function ScrollInput({
  dataArray,
  type = "text",
  value,
  onChange,
  width = "w-12",
}) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up");
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [localArray, setLocalArray] = useState([...dataArray]);
  const touchStartY = useRef(0);
  const scrollTimeout = useRef(null);
  const hasScrolled = useRef(false);

  // Find current index from value prop
  const currentIndex = localArray.findIndex((v) => v === value);

  const formatValue = (val) => {
    if (type === "number") return val.toString().padStart(2, "0");
    return val;
  };

  const handleValueChange = useCallback(
    (direction) => {
      const len = localArray.length;
      const currentIndex = localArray.findIndex((v) => v === value);
      const safeIndex = currentIndex === -1 ? 0 : currentIndex;
      let next = safeIndex + direction;
      if (next < 0) next = len - 1;
      if (next >= len) next = 0;
      if (onChange) onChange(localArray[next]);
      setIsScrolling(true);
      setScrollDirection(direction > 0 ? "up" : "down");

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 20);
    },
    [localArray, value, onChange]
  );

  const handleWheel = (e) => {
    const direction = e.deltaY > 0 ? -1 : 1;
    handleValueChange(direction);
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    setIsScrolling(true);
    hasScrolled.current = false;
  };

  const handleTouchMove = (e) => {
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
    setTimeout(() => setIsScrolling(false), 20);
  };

  const handleDecrement = (e) => {
    handleValueChange(-1);
  };
  const handleIncrement = (e) => {
    handleValueChange(1);
  };

  // Editing logic
  const handleMainValueClick = () => {
    // If value is not found, fallback to first item
    const val = value ?? localArray[0];
    setEditValue(val);
    setIsEditing(true);
  };

  const handleInputBlur = () => {
    let newVal = editValue;
    if (type === "number") {
      newVal = newVal.replace(/\D/g, "");
      if (newVal === "") newVal = "00";
      newVal = newVal.padStart(2, "0");
    }
    if (newVal.trim() !== "") {
      // If not in localArray, add it
      if (!localArray.includes(newVal)) {
        setLocalArray((arr) => [...arr, newVal]);
      }
      if (onChange) onChange(newVal);
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur(); // triggers handleInputBlur
    }
  };

  return (
    <div className="rounded-3xl w-fit">
      <div className="relative flex flex-col items-center">
        {/* Top Control Button (Chevron Up) */}
        {/* <motion.button
          className="w-10 h-10 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-700 active:bg-gray-600 mb-2 transition-opacity duration-200"
          whileTap={{ scale: 0.9 }}
          onClick={handleIncrement}
          aria-label="Increment"
        >
          <FontAwesomeIcon icon={faChevronUp} className="w-5 h-5" />
        </motion.button> */}

        {/* Main Value Display */}
        <div
          className="relative flex items-center justify-center"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "none" }}
        >
          <div
            id="main-value"
            className={
              width +
              " relative bg-gray-100/80 rounded-2xl h-32 flex items-center justify-center cursor-pointer"
            }
            onClick={handleMainValueClick}
          >
            <motion.div
              className="absolute -top-1/2 inset-0 rounded-2xl opacity-50"
              animate={{
                scale: isScrolling ? 1.02 : 1,
              }}
              transition={{ duration: 0.1 }}
            />

            <div className="relative z-3 flex items-center justify-center w-full">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <input
                    autoFocus
                    type={type === "number" ? "number" : "text"}
                    className="text-gray-700 text-4xl font-light text-center tracking-tight bg-transparent border-none outline-none w-full"
                    value={editValue}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      setEditValue(
                        type === "text"
                          ? e.target.value.toUpperCase()
                          : e.target.value
                      )
                    }
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                  />
                ) : (
                  <motion.div
                    key={value ?? localArray[currentIndex]}
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
                    className="text-gray-700 text-4xl font-light text-center tracking-tight w-full"
                  >
                    {formatValue(value ?? localArray[currentIndex])}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Top and Bottom Fades */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>

        {/* Bottom Control Button (Chevron Down) */}
        {/* <motion.button
          className="w-10 h-10 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-700 active:bg-gray-600 mt-2 transition-opacity duration-200"
          whileTap={{ scale: 0.9 }}
          onClick={handleDecrement}
          aria-label="Decrement"
        >
          <FontAwesomeIcon icon={faChevronDown} className="w-5 h-5" />
        </motion.button> */}
      </div>
    </div>
  );
}
