"use client";

import { createContext, useContext, useState } from "react";
import { Loader2 } from "lucide-react";

const LoadingContext = createContext({
  showLoading: () => {},
  hideLoading: () => {},
});

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ showLoading: () => setIsLoading(true), hideLoading: () => setIsLoading(false) }}>
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <Loader2 className="w-12 h-12 text-[#0a6ed1] animate-spin" />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);