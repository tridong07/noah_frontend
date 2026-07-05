"use client";

import React from "react";
import { Globe, HelpCircle } from "lucide-react";
import AuthFormManager from "@/features/auth/forms/AuthFormManager";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/context/LanguageContext";

export default function SapLoginPage() {
  const { language, toggleLanguage } = useLanguage();
  const { t, loading } = useTranslation(language);

  if (loading) return <div className="flex h-screen items-center justify-center bg-[var(--color-background)]">Loading...</div>;

  return (
    <div className="flex min-h-screen font-sans antialiased bg-[var(--color-background)]">
      
      {/* LEFT: Branding & Graphic Side - Giữ màu cố định */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a1924] p-12 flex-col justify-between overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1d2d3d] rounded-full -mr-20 -mt-20 opacity-50 blur-3xl" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-16 bg-[#f0b400] rounded-sm flex items-center justify-center font-black text-black text-xs tracking-wider shadow-lg">
            SAP
          </div>
          <span className="text-white/90 font-light text-xl">Intelligent Enterprise</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-extralight text-white leading-tight">
            {t("main_title", "page_login", "Quản trị thông minh,")}<br />
            <span className="font-semibold text-[#4db1ff]">{t("main_subtitle", "page_login", "Vận hành tối ưu.")}</span>
          </h1>
          <p className="mt-6 text-base text-zinc-400 max-w-sm leading-relaxed">
            {t("main_desc", "page_login", "Hệ thống quản lý nguồn lực doanh nghiệp tập trung, hiện đại và bảo mật tuyệt đối.")}
          </p>
        </div>

        <div className="text-xs text-zinc-600 uppercase tracking-widest font-medium">© 2026 Enterprise System</div>
      </div>

      {/* RIGHT: Login Form Side - Theo biến globals */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 bg-[var(--color-background)]">
        {/* Header Actions */}
        <div className="absolute top-8 right-8 flex gap-6 text-sm">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-[var(--color-sap-blue)] font-semibold hover:opacity-80 transition-all"
          >
            <Globe className="h-4 w-4" />
            {language === "vi" ? "English" : "Tiếng Việt"}
          </button>
          <button className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-sap-blue)] transition-all">
            <HelpCircle className="h-4 w-4" />
            {t("helpText", "page_login", "Help")}
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="w-full max-w-sm mx-auto animate-in fade-in zoom-in duration-500">
           <AuthFormManager />
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center text-[11px] text-[var(--color-text-muted)]">
          {t("footer_text", "common", "SAP Cloud Identity Services • Privacy Policy")}
        </div>
      </div>
    </div>
  );
}