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
      className={`w-full rounded-lg bg-[#0a6ed1] py-2.5 font-medium text-sm text-white 
        /* Hover/Active states */
        hover:bg-[#085caf] active:bg-[#064b8f] 
        /* Dark Mode overrides */
        dark:dark:bg-[#085caf] dark:hover:bg-[#085caf] dark:active:bg-[#064b8f]
        /* Transitions & Layout */
        transition-colors flex items-center justify-center gap-2 
        /* Disabled state */
        disabled:opacity-70 disabled:cursor-not-allowed select-none ${className}`}
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        children
      )}
    </motion.button>
  );
}