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
          left: "calc(50% - 600px + 1rem - 50px)", // Center minus half container width plus left padding, moved 50px left
          top: "0", // Start from very top of page
          height: "calc(96px + 24px + 520px + 60px - 130px + 60px)", // Extended 60px past intersection point
          backgroundColor: "#70707099"
        }}
      ></div>
      {/* Horizontal line - meets vertical line at its bottom end (positive X-axis) - hidden on mobile */}
      <div 
        className="absolute z-10 h-px pointer-events-none hidden md:block"
        style={{
          left: "calc(50% - 600px + 1rem - 50px)", // Start from vertical line intersection, moved 50px left
          top: "calc(96px + 24px + 520px + 60px - 130px + 60px)", // Match the bottom end of vertical line
          width: "850px", // Extended length by 50px to maintain same right endpoint
          backgroundColor: "#70707099"
        }}
      ></div>
    </>
  );
}
