// src/app/home/page.tsx
"use client";

import React from "react";
import { Launchpad } from "@/features/launchpad/components/Launchpad";
import { useMenuData } from "@/hooks/useMenuData";

export default function HomePage() {
  const { data: menuData, isLoading, error } = useMenuData();

  if (isLoading) return (
    <div className="max-w-7xl mx-auto py-8 px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        // Thêm dark:bg-zinc-800 để khung skeleton trông tối hơn khi ở Dark Mode
        <div key={i} className="h-32 bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-xl" />
      ))}
    </div>
  );
  
  if (error) return <div className="text-slate-800 dark:text-zinc-200">Error loading menu: {error.message}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 transition-colors">
      {/* Page Title */}
      <div className="px-8 mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Launchpad
        </h1>
        <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">
          Hệ thống quản trị nguồn lực doanh nghiệp tập trung.
        </p>
      </div>

      <Launchpad menuData={menuData} />
    </div>
  );
}