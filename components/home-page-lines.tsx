"use client";

import { usePathname } from "next/navigation";

// Component for rendering decorative lines only on the home page
export function HomePageLines() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  if (!isHomePage) {
    return null;
  }

  const cornerTop = 630; // calc(96px + 24px + 520px + 60px - 130px + 60px) = 630px
  const cornerRadius = 70; // Perfect roundness
  const lineColor = "rgba(112, 112, 112, 0.6)";

  return (
    <>
      {/* Vertical line - extends from top of page to just before the corner */}
      <div 
        className="absolute z-10 pointer-events-none hidden md:block"
        style={{
          left: "calc(50% - 600px + 1rem - 50px)",
          top: "0",
          width: "1px",
          height: `${cornerTop - cornerRadius}px`,
          backgroundColor: lineColor
        }}
      ></div>
      
      {/* Rounded corner using SVG */}
      <svg
        className="absolute z-10 pointer-events-none hidden md:block"
        style={{
          left: "calc(50% - 600px + 1rem - 50px)",
          top: `${cornerTop - cornerRadius}px`,
          width: `${cornerRadius}px`,
          height: `${cornerRadius}px`,
          overflow: "visible"
        }}
        viewBox={`0 0 ${cornerRadius} ${cornerRadius}`}
        preserveAspectRatio="none"
      >
        <path
          d={`M 0.5 0 Q 0 ${cornerRadius} ${cornerRadius} ${cornerRadius - 0.5}`}
          stroke={lineColor}
          strokeWidth="1"
          fill="none"
        />
      </svg>

      {/* Horizontal line - starts after the rounded corner */}
      <div 
        className="absolute z-10 pointer-events-none hidden md:block"
        style={{
          left: `calc(50% - 600px + 1rem - 50px + ${cornerRadius}px)`,
          top: `${cornerTop}px`,
          height: "1px",
          width: `${850 - cornerRadius}px`,
          backgroundColor: lineColor
        }}
      ></div>
    </>
  );
}
