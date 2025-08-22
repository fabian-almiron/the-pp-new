"use client";

import { usePathname } from "next/navigation";

// Component for rendering decorative lines only on the home page
export function HomePageLines() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  if (!isHomePage) {
    return null;
  }

  return (
    <>
      {/* Vertical line - extends from top of page through header past intersection point - hidden on mobile */}
      <div 
        className="absolute z-10 w-px pointer-events-none hidden md:block"
        style={{
          left: "calc(50% - 600px + 1rem)", // Center minus half container width plus left padding
          top: "0", // Start from very top of page
          height: "calc(96px + 24px + 520px + 60px - 130px + 60px)", // Extended 60px past intersection point
          backgroundColor: "#707070"
        }}
      ></div>
      {/* Horizontal line - meets vertical line at its bottom end (positive X-axis) - hidden on mobile */}
      <div 
        className="absolute z-10 h-px pointer-events-none hidden md:block"
        style={{
          left: "calc(50% - 600px + 1rem)", // Start from vertical line intersection
          top: "calc(96px + 24px + 520px + 60px - 130px + 60px)", // Match the bottom end of vertical line
          width: "800px", // Extended length - only going right
          backgroundColor: "#707070"
        }}
      ></div>
    </>
  );
}
