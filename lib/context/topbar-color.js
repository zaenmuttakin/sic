"use client";

import { createContext, useState } from "react";

export const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const [topbarColor, setTopbarColor] = useState("#E8ECF7"); // Default
  const setDefaultColor = () => {
    setTopbarColor("#E8ECF7");
  };

  return (
    <ColorContext.Provider
      value={{ topbarColor, setTopbarColor, setDefaultColor }}
    >
      {children}
    </ColorContext.Provider>
  );
};
