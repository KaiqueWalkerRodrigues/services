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
export type ButtonVariant = "solid" | "outline";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  color?: ButtonColor;
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-8 py-4 text-lg",
};

// Separamos os estilos por variante, mantendo o outline idêntico ao seu original
const colorStyles: Record<ButtonVariant, Record<ButtonColor, string>> = {
  outline: {
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
  },
  solid: {
    success:
      "bg-[#22c55e] border-[#22c55e] text-white hover:bg-[#16a34a] hover:border-[#15803d] focus:ring-[#22c55e]/50",
    danger:
      "bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#963333] hover:border-[#963333] focus:ring-[#ef4444]/50",
    warning:
      "bg-[#eab308] border-[#eab308] text-black hover:bg-[#ca8a04] hover:border-[#a16207] focus:ring-[#eab308]/50",
    primary:
      "bg-[#3b82f6] border-[#3b82f6] text-white hover:bg-[#2563eb] hover:border-[#1d4ed8] focus:ring-[#3b82f6]/50",
    secondary:
      "bg-[#6b7280] border-[#6b7280] text-white hover:bg-[#4b5563] hover:border-[#374151] focus:ring-[#6b7280]/50",
    white:
      "bg-white border-white text-black hover:bg-[#f3f4f6] hover:border-[#e5e7eb] focus:ring-white/50",
  },
};

export function Button({
  size = "md",
  color = "primary",
  variant = "solid",
  className = "",
  children,
  ...props
}: ButtonProps) {
  // Removeu-se o "bg-transparent" fixo da baseStyles para permitir que a variante solid aplique o background
  const baseStyles =
    "cursor-pointer border font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]";

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${colorStyles[variant][color]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
