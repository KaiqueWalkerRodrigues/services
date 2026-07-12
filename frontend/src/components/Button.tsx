"use client";

import React from "react";

export type ButtonSize = "sm" | "md" | "lg" | "xl";
export type ButtonColor =
  | "success"
  | "danger"
  | "warning"
  | "primary"
  | "secondary"
  | "white"
  | "info"
  | "light"
  | "dark"
  | "purple"
  | "indigo"
  | "pink"
  | "orange"
  | "teal";
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

    info: "border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10 focus:ring-[#06b6d4]/50",

    light:
      "border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6] focus:ring-[#d1d5db]/50",

    dark: "border-[#111827] text-[#111827] hover:bg-[#111827]/10 focus:ring-[#111827]/50",

    purple:
      "border-[#a855f7] text-[#a855f7] hover:bg-[#a855f7]/10 focus:ring-[#a855f7]/50",

    indigo:
      "border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/10 focus:ring-[#6366f1]/50",

    pink: "border-[#ec4899] text-[#ec4899] hover:bg-[#ec4899]/10 focus:ring-[#ec4899]/50",

    orange:
      "border-[#f97316] text-[#f97316] hover:bg-[#f97316]/10 focus:ring-[#f97316]/50",

    teal: "border-[#14b8a6] text-[#14b8a6] hover:bg-[#14b8a6]/10 focus:ring-[#14b8a6]/50",
  },
  solid: {
    success:
      "bg-[#22c55e] border-[#22c55e] text-white hover:bg-[#16a34a] hover:border-[#15803d] focus:ring-[#22c55e]/50",

    danger:
      "bg-[#ef4444] border-[#ef4444] text-white hover:bg-[#dc2626] hover:border-[#b91c1c] focus:ring-[#ef4444]/50",

    warning:
      "bg-[#eab308] border-[#eab308] text-black hover:bg-[#ca8a04] hover:border-[#a16207] focus:ring-[#eab308]/50",

    primary:
      "bg-[#3b82f6] border-[#3b82f6] text-white hover:bg-[#2563eb] hover:border-[#1d4ed8] focus:ring-[#3b82f6]/50",

    secondary:
      "bg-[#6b7280] border-[#6b7280] text-white hover:bg-[#4b5563] hover:border-[#374151] focus:ring-[#6b7280]/50",

    white:
      "bg-white border-white text-black hover:bg-[#f3f4f6] hover:border-[#e5e7eb] focus:ring-white/50",

    info: "bg-[#06b6d4] border-[#06b6d4] text-white hover:bg-[#0891b2] hover:border-[#0e7490] focus:ring-[#06b6d4]/50",

    light:
      "bg-[#f3f4f6] border-[#d1d5db] text-[#111827] hover:bg-[#e5e7eb] hover:border-[#9ca3af] focus:ring-[#d1d5db]/50",

    dark: "bg-[#111827] border-[#111827] text-white hover:bg-[#1f2937] hover:border-[#374151] focus:ring-[#111827]/50",

    purple:
      "bg-[#a855f7] border-[#a855f7] text-white hover:bg-[#9333ea] hover:border-[#7e22ce] focus:ring-[#a855f7]/50",

    indigo:
      "bg-[#6366f1] border-[#6366f1] text-white hover:bg-[#4f46e5] hover:border-[#4338ca] focus:ring-[#6366f1]/50",

    pink: "bg-[#ec4899] border-[#ec4899] text-white hover:bg-[#db2777] hover:border-[#be185d] focus:ring-[#ec4899]/50",

    orange:
      "bg-[#f97316] border-[#f97316] text-white hover:bg-[#ea580c] hover:border-[#c2410c] focus:ring-[#f97316]/50",

    teal: "bg-[#14b8a6] border-[#14b8a6] text-white hover:bg-[#0d9488] hover:border-[#0f766e] focus:ring-[#14b8a6]/50",
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
