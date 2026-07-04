"use client";

import React, { useState } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Bell, Search } from "lucide-react";
import { UserMenu } from "@/components/layout/UserMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useUserProfile } from "@/features/auth/hooks/useUserProfile";
import { UserModal } from "@/features/auth/components/ProfileModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"profile" | "settings">("profile");
  const { data: user, isLoading } = useUserProfile();

  // Hàm mở Modal với tab chỉ định
  const openModal = (tab: "profile" | "settings") => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans transition-colors duration-300">
      <header className="bg-[#1d2d3d] dark:bg-zinc-900 text-white px-6 py-2.5 flex items-center justify-between shadow-md sticky top-0 z-40 border-b border-zinc-800 transition-colors">
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg text-[#f0b400]">SAP</div>
          <span className="border-l border-white/20 pl-4 text-sm font-light opacity-90">Enterprise System</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center bg-white/10 dark:bg-zinc-800 rounded-full px-3 py-1 transition-colors">
            <Search size={14} className="text-white/70" />
            <input className="bg-transparent border-none outline-none text-xs ml-2 w-32 placeholder-white/50 dark:placeholder-zinc-400 text-white" placeholder="Search..."/>
          </div>
          
          <LanguageSwitcher />
          <button className="hover:text-[#4db1ff] dark:hover:text-blue-400 transition-colors">
            <Bell size={18} />
          </button>
          <UserMenu onOpenModal={openModal} />
        </div>
      </header>
      {isModalOpen && (
        <UserModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          user={user} 
          isLoading={isLoading}
          initialTab={modalTab}
        />
      )}

      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
        <Breadcrumb />
      </div>

      <main className="p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}