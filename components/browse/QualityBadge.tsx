"use client";

interface QualityBadgeProps {
  quality?: "HD" | "SD" | "4K" | "1080p" | "720p";
  size?: "sm" | "md";
}

export function QualityBadge({ quality = "HD", size = "sm" }: QualityBadgeProps) {
  const qualityConfig: Record<string, { label: string; color: string; bg: string }> = {
    "4K": { label: "4K", color: "#a855f7", bg: "rgba(168, 85, 247, 0.15)" },
    "1080p": { label: "FHD", color: "#22d3ee", bg: "rgba(34, 211, 238, 0.15)" },
    "720p": { label: "HD", color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)" },
    "HD": { label: "HD", color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)" },
    "SD": { label: "SD", color: "#8b949e", bg: "rgba(139, 148, 158, 0.15)" },
  };

  const config = qualityConfig[quality] || qualityConfig["HD"];
  const sizeStyles = size === "sm" 
    ? "text-[10px] px-1.5 py-0.5" 
    : "text-xs px-2 py-1";

  return (
    <span 
      className={`inline-flex items-center font-semibold rounded ${sizeStyles}`}
      style={{ 
        color: config.color, 
        background: config.bg,
        border: `1px solid ${config.color}40`
      }}
    >
      {config.label}
    </span>
  );
}

export default QualityBadge;