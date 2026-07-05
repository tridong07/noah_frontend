"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Languages } from "lucide-react";

export const LanguageSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Nếu chưa mounted, đừng render (hoặc render một cái placeholder trống)
  if (!mounted) {
    return <div className="w-10 h-8" />; // Placeholder giữ chỗ để tránh nhảy layout
  }

  return (
    <button
      onClick={toggleLanguage}
      className="
        flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200
        /* Sử dụng biến màu chung cho cả sáng và tối */
        bg-[var(--color-card-bg)]
        border border-[var(--color-border-subtle)]
        text-[var(--color-foreground)]
        hover:bg-[var(--color-border-subtle)]/30
      "
      title={language === "vi" ? "Chuyển sang Tiếng Anh" : "Switch to Vietnamese"}
    >
      <Languages size={14} />
      <span className="text-[11px] font-bold uppercase tracking-wider">
        {language}
      </span>
    </button>
  );
};