"use client";

import { createContext, useState } from "react";

export const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const [topbarColor, setTopbarColor] = useState("#E8ECF7"); // Default
  const setDefaultColor = () => {
    setTopbarColor("#E8ECF7");
  };
  const topColors = {
    default: "#E8ECF7",
    white: "#ffffff",
    onmodal: "#a2a5ac",
  };

  return (
    <ColorContext.Provider value={{ topbarColor, setTopbarColor, topColors }}>
      {children}
    </ColorContext.Provider>
  );
};
