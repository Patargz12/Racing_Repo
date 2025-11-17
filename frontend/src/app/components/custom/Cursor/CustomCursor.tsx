"use client";

import { useEffect, useRef } from "react";
import "./CustomCursor.css";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!dot || !ring) return;

    const updateCursorPosition = (e: MouseEvent) => {
      // Use transform for better performance (GPU accelerated)
      const x = e.clientX;
      const y = e.clientY;

      // Center both elements by offsetting by half their size
      dot.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
      ring.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
    };

    const updateCursorType = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.onclick !== null ||
        window.getComputedStyle(target).cursor === "pointer";

      if (isClickable) {
        dot.classList.add("pointer");
        ring.classList.add("pointer");
      } else {
        dot.classList.remove("pointer");
        ring.classList.remove("pointer");
      }
    };

    window.addEventListener("mousemove", updateCursorPosition);
    window.addEventListener("mouseover", updateCursorType);

    return () => {
      window.removeEventListener("mousemove", updateCursorPosition);
      window.removeEventListener("mouseover", updateCursorType);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" />
      <div ref={ringRef} className="custom-cursor-ring" />
    </>
  );
}
