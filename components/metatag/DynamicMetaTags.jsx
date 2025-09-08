// components/DynamicMetaTags.jsx
"use client";

import { useContext } from "react";
import { ColorContext } from "../../lib/context/topbar-color";
import { UseDynamicMetadata } from "../../lib/func/useDynamicMetadata";

export default function DynamicMetaTags() {
  const { topbarColor } = useContext(ColorContext);

  // This hook will update the meta tags when the color changes
  UseDynamicMetadata(topbarColor);

  return null; // This component doesn't render anything
}
