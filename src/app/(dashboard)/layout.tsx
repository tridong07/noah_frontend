"use client";

import React from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { LogOut, User, Bell } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans">
      {/* Top Header - Chuẩn SAP Fiori */}
      <header className="bg-[#1d2d3d] text-white px-8 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg tracking-wider text-[#f0b400]">SAP</div>
          <span className="border-l border-white/20 pl-4 text-sm font-medium">Enterprise System</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="hover:text-[#4db1ff] transition-colors"><Bell size={18} /></button>
          <button className="flex items-center gap-2 text-sm hover:text-[#4db1ff] transition-colors">
            <User size={18} /> Admin
          </button>
          <button className="hover:text-rose-400 transition-colors"><LogOut size={18} /></button>
        </div>
      </header>

      {/* Breadcrumb - Thanh điều hướng trạng thái */}
      <Breadcrumb />

      {/* Main Content */}
      <main className="transition-all duration-300">
        {children}
      </main>
    </div>
  );
}