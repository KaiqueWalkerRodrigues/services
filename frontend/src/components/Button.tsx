"use client";

import React from "react";

export type ButtonSize = "sm" | "md" | "lg" | "xl";
export type ButtonColor =
  | "success"
  | "danger"
  | "warning"
  | "primary"
  | "secondary"
  | "white";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  color?: ButtonColor;
  children: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-8 py-4 text-lg",
};

const colorStyles: Record<ButtonColor, string> = {
  success:
    "border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/10 focus:ring-[#22c55e]/50",
  danger:
    "border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10 focus:ring-[#ef4444]/50",
  warning:
    "border-[#eab308] text-[#eab308] hover:bg-[#eab308]/10 focus:ring-[#eab308]/50",
  primary:
    "border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 focus:ring-[#3b82f6]/50",
  secondary:
    "border-[#6b7280] text-[#6b7280] hover:bg-[#6b7280]/10 focus:ring-[#6b7280]/50",
  white: "border-white text-white hover:bg-white/10 focus:ring-white/50",
};

export function Button({
  size = "md",
  color = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "cursor-pointer border bg-transparent font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]";

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${colorStyles[color]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
