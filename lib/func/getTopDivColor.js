export const getTopDivColor = () => {
  if (typeof window === "undefined") return "#3498db";

  // Get all elements at the top of the page
  const elements = document.elementsFromPoint(window.innerWidth / 2, 10);
  console.log(elements);

  // Find the first non-transparent element
  for (let el of elements) {
    const bgColor = window.getComputedStyle(el).backgroundColor;

    // Skip transparent and body elements
    if (
      bgColor !== "rgba(0, 0, 0, 0)" &&
      bgColor !== "transparent" &&
      el.tagName !== "BODY"
    ) {
      return bgColor;
    }
  }

  return "#3498db"; // Default color
};
