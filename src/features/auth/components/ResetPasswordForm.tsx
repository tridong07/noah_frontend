"use client";

import React from "react";
import { KeyRound, ArrowLeft } from "lucide-react";
import SapInput from "@/components/ui/SapInput";
import SapButton from "@/components/ui/SapButton";

interface ResetProps {
  onReset: (e: React.FormEvent) => void;
  isLoading: boolean;
  t: (key: string, ns: string, def: string) => string;
}

export const ResetPasswordForm = ({ onReset, isLoading, t }: ResetProps) => (
  <form onSubmit={onReset} className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm border border-slate-200">
    <div className="space-y-1">
      <h2 className="text-2xl font-bold text-[#222629]">
        {t("resetTitle", "auth", "Reset Password")}
      </h2>
      <p className="text-sm text-slate-500">
        {t("resetSubtitle", "auth", "Enter the OTP and your new password")}
      </p>
    </div>

    <div className="space-y-4">
      <SapInput icon={KeyRound} name="otp" placeholder={t("otpPlaceholder", "auth", "Enter OTP Code")} required />
      <SapInput icon={Lock} type="password" name="password" placeholder={t("newPassPlaceholder", "auth", "New Password")} required />
    </div>
    
    <SapButton type="submit" isLoading={isLoading} className="w-full">
      {t("updatePassword", "auth", "Update Password")}
    </SapButton>
  </form>
);