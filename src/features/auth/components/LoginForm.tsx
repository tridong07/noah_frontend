"use client";

import React, { useState } from "react";
import { User, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import SapInput from "@/components/ui/SapInput";
import SapButton from "@/components/ui/SapButton";

interface LoginFormProps {
  onLogin: (e: React.FormEvent, credentials: { username: string, password: string }) => void;
  onForgot: () => void;
  isLoading: boolean;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  username: string; 
  setUsername: (val: string) => void;
  t: (key: string, ns: string, def: string) => string;
}

export const LoginForm = ({ onLogin, onForgot, isLoading, rememberMe, setRememberMe, username, setUsername, t }: LoginFormProps) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    onLogin(e, { username, password });
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-[#222629]"> {t("title", "auth", "System Sign In")}</h2>
        <p className="text-sm text-slate-500"> {t("subtitle", "auth", "Please enter your credentials")}</p>
      </div>
      <SapInput icon={User} name="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
      <SapInput icon={Lock} type="password" name="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          <span className="text-slate-600 group-hover:text-[#0a6ed1] transition-colors">
            {t("rememberMe", "auth", "Remember me")}
          </span>
        </label>
        <button type="button" onClick={onForgot} className="text-[#0a6ed1] font-medium hover:underline">{t("forgotPassword", "auth", "Forgot Password?")}</button>
      </div>
      <SapButton type="submit" isLoading={isLoading} className="w-full">
        <span className="flex items-center justify-center gap-2">
          {t("signIn", "auth", "Sign In")} <ArrowRight className="h-4 w-4" />
        </span>
      </SapButton>
    </form>
  );
}
  