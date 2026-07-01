"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Languages } from "lucide-react";

export const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/10"
      title={language === "vi" ? "Chuyển sang Tiếng Anh" : "Switch to Vietnamese"}
    >
      <Languages size={14} />
      <span className="text-[11px] font-bold uppercase tracking-wider">
        {language}
      </span>
    </button>
  );
};