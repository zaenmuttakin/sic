// hooks/useDynamicMetadata.js
"use client";

import { useEffect } from "react";

export const UseDynamicMetadata = (color) => {
  useEffect(() => {
    // Update theme-color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", color);
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = color;
      document.head.appendChild(meta);
    }

    // Update msapplication-navbutton-color for Microsoft browsers
    const msAppNavButton = document.querySelector(
      'meta[name="msapplication-navbutton-color"]'
    );
    if (msAppNavButton) {
      msAppNavButton.setAttribute("content", color);
    } else {
      const meta = document.createElement("meta");
      meta.name = "msapplication-navbutton-color";
      meta.content = color;
      document.head.appendChild(meta);
    }

    // Update apple-mobile-web-app-status-bar-style for iOS
    const appleStatusBar = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]'
    );
    if (appleStatusBar) {
      appleStatusBar.setAttribute("content", color);
    }
  }, [color]);
};
