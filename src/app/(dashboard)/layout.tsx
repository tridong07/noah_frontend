"use client";

import React, { useState } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Bell, Search } from "lucide-react";
import { UserMenu } from "@/components/layout/UserMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useUserProfile } from "@/features/auth/hooks/useUserProfile";
import { ProfileModal } from "@/components/layout/ProfileModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: user, isLoading } = useUserProfile();

  return (
    <div className="min-h-screen bg-[#f1f3f5] font-sans">
      <header className="bg-[#1d2d3d] text-white px-6 py-2.5 flex items-center justify-between shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg text-[#f0b400]">SAP</div>
          <span className="border-l border-white/20 pl-4 text-sm font-light opacity-90">Enterprise System</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center bg-white/10 rounded-full px-3 py-1">
            <Search size={14} />
            <input className="bg-transparent border-none outline-none text-xs ml-2 w-32 placeholder-white/50" placeholder="Search..." />
          </div>
          
          <LanguageSwitcher />
          <button className="hover:text-[#4db1ff] transition-colors"><Bell size={18} /></button>
          <UserMenu setIsModalOpen={setIsModalOpen} />
        </div>
      </header>
      {isModalOpen && (
        <ProfileModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          user={user} 
          isLoading={isLoading}
        />
      )}

      <div className="bg-white border-b border-slate-200">
        <Breadcrumb />
      </div>

      <main className="p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}