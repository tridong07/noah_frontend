"use client";

import React from "react";
import { User, ArrowLeft } from "lucide-react";
import SapInput from "@/components/ui/SapInput";
import SapButton from "@/components/ui/SapButton";

interface ForgotProps {
  onForgot: (e: React.FormEvent) => void;
  onBack: () => void;
  isLoading: boolean;
  t: (key: string, ns: string, def: string) => string;
}

export const ForgotPasswordForm = ({ onForgot, onBack, isLoading, t }: ForgotProps) => (
  <form onSubmit={onForgot} className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm border border-slate-200">
    <div className="space-y-1">
      <h2 className="text-2xl font-bold text-[#222629]">
        {t("forgotTitle", "auth", "Forgot Password")}
      </h2>
      <p className="text-sm text-slate-500">
        {t("forgotSubtitle", "auth", "Enter your username to receive an OTP")}
      </p>
    </div>

    <SapInput icon={User} name="username" placeholder={t("usernamePlaceholder", "auth", "Enter your Username")} required />
    <SapButton type="submit" isLoading={isLoading} className="w-full">
      {t("sendOtp", "auth", "Send OTP")}
    </SapButton>
    <button type="button" onClick={onBack} 
      className="flex items-center justify-center gap-2 text-sm text-[#0a6ed1] font-semibold hover:underline transition-all">
      <ArrowLeft className="h-4 w-4" /> 
      {t("back", "auth", "Back")}
    </button>
  </form>
);