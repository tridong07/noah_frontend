"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface SapButtonProps extends HTMLMotionProps<"button"> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function SapButton({ isLoading, children, className = "", ...props }: SapButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      {...props}
      disabled={isLoading || props.disabled}
      className={`
        /* Layout & Sizing */
        w-full flex items-center justify-center gap-2 select-none rounded-lg py-2.5 font-medium text-sm
        /* Colors - Sử dụng trực tiếp biến từ @theme */
        bg-[var(--color-sap-blue)] 
        text-white
        transition-colors
        hover:bg-[var(--color-sap-blue-hover)] 
        active:opacity-90
        /* States */
        disabled:opacity-50 disabled:cursor-not-allowed
        /* Cho phép ghi đè từ component cha qua className */
        ${className}
      `}
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        children
      )}
    </motion.button>
  );
}