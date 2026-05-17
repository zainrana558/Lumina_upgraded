"use client";

import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  asLink?: boolean;
}

export default function Logo({ size = "md", asLink = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };

  const svgSizes = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  const logo = (
    <div className="flex items-center gap-2">
      {/* Lumina Logo - Stylized L */}
      <svg
        width={svgSizes[size]}
        height={svgSizes[size]}
        viewBox="0 0 40 40"
        fill="none"
        className={sizeClasses[size]}
      >
        {/* Background circle/gradient */}
        <defs>
          <linearGradient id="luminaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#58a6ff" />
            <stop offset="50%" stopColor="#388bfd" />
            <stop offset="100%" stopColor="#39d353" />
          </linearGradient>
        </defs>
        
        {/* Outer glow */}
        <circle cx="20" cy="20" r="18" fill="url(#luminaGrad)" fillOpacity="0.15" />
        
        {/* L letter stylized */}
        <path
          d="M12 28V12h4v12h10v4H12z"
          fill="url(#luminaGrad)"
          className="drop-shadow-glow"
        />
        
        {/* Accent dot */}
        <circle cx="28" cy="12" r="3" fill="#39d353" className="animate-pulse" />
      </svg>
      
      {/* Logo Text */}
      <span 
        className={`font-bold tracking-tight ${
          size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl"
        }`}
        style={{
          background: "linear-gradient(135deg, #58a6ff 0%, #39d353 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Lumina
      </span>
    </div>
  );

  if (asLink) {
    return (
      <Link href="/browse" className="flex items-center">
        {logo}
      </Link>
    );
  }

  return logo;
}