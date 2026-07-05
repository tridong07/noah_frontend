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
    <div className="px-8 py-3 bg-[var(--color-card-bg)] border-b border-[var(--color-border-subtle)] text-sm transition-colors">
      <div className="flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-[var(--color-border-subtle)]">/</span>}
            <span 
              className={
                index === breadcrumbs.length - 1 
                  ? "font-bold text-[var(--color-sap-blue)]" 
                  : "text-[var(--color-text-muted)]"
              }
            >
              {crumb}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};