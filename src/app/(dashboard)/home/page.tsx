// src/app/home/page.tsx
"use client";

import React from "react";
import { MenuLaunchpad } from "@/components/layout/MenuLaunchpad";
import { useMenuData } from "@/hooks/useMenuData";

export default function HomePage() {
  const { data: menuData, isLoading, error } = useMenuData();

  if (isLoading) return (
    <div className="max-w-7xl mx-auto py-8 px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-xl" />
      ))}
    </div>
  );
  if (error) return <div>Error loading menu: {error.message}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Page Title */}
      <div className="px-8 mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Launchpad</h1>
        <p className="text-slate-500 text-sm mt-1">Hệ thống quản trị nguồn lực doanh nghiệp tập trung.</p>
      </div>

      <MenuLaunchpad menuData={menuData} />
    </div>
  );
}