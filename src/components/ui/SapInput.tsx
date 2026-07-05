"use client";

import React, { useState } from "react";
import { Eye, EyeOff, LucideIcon } from "lucide-react";

interface SapInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
}

export default function SapInput({ icon: Icon, type = "text", className = "", ...props }: SapInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`
      relative flex items-center w-full rounded-lg px-3 transition-all
      /* Sử dụng biến từ globals.css */
      bg-[var(--color-input-bg)] 
      border border-[var(--color-border-subtle)]
      /* Focus States - Dùng biến sap-blue */
      focus-within:border-[var(--color-sap-blue)] 
      focus-within:ring-1 
      focus-within:ring-[var(--color-sap-blue)]
      ${className}
    `}>
      
      {Icon && (
        <Icon className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" />
      )}
      
      <input
        type={inputType}
        {...props}
        className={`
          w-full bg-transparent py-2.5 pl-2.5 pr-8 text-sm outline-none 
          text-[var(--color-foreground)] 
          placeholder:text-[var(--color-text-muted)]
        `}
      />
      
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 text-[var(--color-text-muted)] hover:text-[var(--color-foreground)] focus:outline-none transition-colors"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}