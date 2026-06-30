"use client";
import { useMenuContext } from "@/context/MenuContext";
import { usePathname } from "next/navigation";

export const Breadcrumb = () => {
  const { breadcrumbs } = useMenuContext();
  const pathname = usePathname();
  
  if (breadcrumbs.length === 0) return null;

  if (pathname === "/home" || pathname === "/") {
    return null;
  }

  return (
    <div className="px-8 py-3 bg-white border-b border-slate-200 text-sm">
      <div className="flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-slate-400">/</span>}
            <span className={index === breadcrumbs.length - 1 ? "font-bold text-[#0a6ed1]" : "text-slate-600"}>
              {crumb}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};