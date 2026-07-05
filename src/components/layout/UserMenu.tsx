"use client";

import React, { useState, useRef, useEffect } from "react";
import { LogOut, User, Settings, ShieldCheck, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useUserProfile } from "@/features/auth/hooks/useUserProfile";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthManager } from "@/features/auth/hooks/useAuthManager";

interface UserMenuProps {
  onOpenModal: (tab: "profile" | "settings") => void;
}

export const UserMenu = ({ onOpenModal }: UserMenuProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: user, isLoading, isError } = useUserProfile();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const { logout } = useAuthManager();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) return <div className="animate-pulse w-8 h-8 rounded-full bg-[var(--color-border-subtle)]" />;
  if (isError || !user) return <div className="text-[var(--color-danger)] text-xs px-2">Error</div>;

  return (
    <div className="relative border-l border-[var(--color-border-subtle)] pl-2 sm:pl-4 z-[110]" ref={dropdownRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
        className="flex items-center gap-2 hover:bg-[var(--color-border-subtle)]/30 p-1 rounded-lg transition-colors"
        type="button"
      >
        <div className="h-7 w-7 rounded-full bg-[var(--color-sap-blue)] flex items-center justify-center text-xs font-bold text-white uppercase ring-2 ring-[var(--color-background)]">
          {user.shortName}
        </div>
        <span className="text-xs font-medium text-[var(--color-foreground)] hidden sm:inline truncate max-w-[100px]">
          {user.shortName}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-[var(--color-text-muted)] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-[var(--color-card-bg)] rounded-xl shadow-xl border border-[var(--color-border-subtle)] text-[var(--color-foreground)] py-2 z-[120] overflow-hidden"
          >
            {/* User Info Header */}
            <div 
              onClick={() => { onOpenModal("profile"); setIsDropdownOpen(false); }}
              className="px-4 py-3 bg-[var(--color-background)]/50 border-b border-[var(--color-border-subtle)] mb-1 hover:bg-[var(--color-border-subtle)]/30 cursor-pointer"
            >
              <div className="font-semibold text-sm">{user.fullname}</div>
              <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                <strong>{t("employeeId", "home", "ID")}:</strong> {user.id}
                <div className="flex items-center gap-1 mt-1 text-[var(--color-sap-blue)]">
                  <ShieldCheck className="h-3 w-3" /> {user.role}
                </div>
              </div>
            </div>

            {/* Menu Actions */}
            <button onClick={() => { onOpenModal("profile"); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs hover:bg-[var(--color-border-subtle)]/30 text-left">
              <User className="h-4 w-4 text-[var(--color-text-muted)]" /> {t("profileInfo", "home", "Profile")}
            </button>

            <button onClick={() => { onOpenModal("settings"); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs hover:bg-[var(--color-border-subtle)]/30 text-left">
              <Settings className="h-4 w-4 text-[var(--color-text-muted)]" /> {t("accountSettings", "home", "Settings")}
            </button>

            <div className="border-t border-[var(--color-border-subtle)] my-1" />

            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 text-left">
              <LogOut className="h-4 w-4 text-[var(--color-danger)]" /> {t("menuLogout", "home", "Logout")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};