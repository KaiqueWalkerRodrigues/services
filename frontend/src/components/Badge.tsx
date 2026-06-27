import React from "react";

export type BadgeColor = "success" | "danger" | "warning" | "primary" | "secondary" | "default";

export interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const badgeColors: Record<BadgeColor, string> = {
  success: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20",
  danger: "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20",
  warning: "bg-[#eab308]/10 text-[#eab308] border-[#eab308]/20",
  primary: "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20",
  secondary: "bg-[#6b7280]/10 text-[#6b7280] border-[#6b7280]/20",
  default: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export function Badge({ children, color = "default", className = "" }: BadgeProps) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold border ${badgeColors[color]} ${className}`}>
      {children}
    </span>
  );
}