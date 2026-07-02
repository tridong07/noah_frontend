"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuthManager } from "@/features/auth/hooks/useAuthManager";

export default function AuthFormManager() {
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const router = useRouter();
  
  // Dùng các giá trị từ hook
  const { mode, setMode, isLoading, message, executeAuthAction } = useAuthManager();
  
  // Chỉ giữ lại các state local phục vụ cho Form input nếu cần
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Wrapper để gọi action và điều hướng sau khi xong
  const handleAuth = async (endpoint: string, payload: any, nextMode?: "login" | "reset") => {
    const data = await executeAuthAction(endpoint, payload, nextMode);
    if (data && endpoint === 'login') {
      //router.push("/home");
      window.location.href = "/home";
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Hiển thị message lỗi/thành công nếu có */}
      {message.text && (
        <div className={`mb-4 p-2 rounded ${message.isError ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
          {message.text}
        </div>
      )}

      {mode === "login" && (
        <LoginForm 
          isLoading={isLoading} 
          onLogin={(e, credentials) => { e.preventDefault(); handleAuth('login', credentials); }}
          onForgot={() => setMode("forgot")}
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
          username={username}
          setUsername={setUsername}
          t={t}
        />
      )}

      {mode === "forgot" && (
        <ForgotPasswordForm 
          isLoading={isLoading} 
          onForgot={(e) => { e.preventDefault(); handleAuth('forgot', { username }); }}
          onBack={() => setMode("login")} 
          t={t}
        />
      )}

      {mode === "reset" && (
        <ResetPasswordForm 
          isLoading={isLoading} 
          onReset={(e) => { e.preventDefault(); handleAuth('reset', { username }, 'login'); }}
          t={t}
        />
      )}
    </div>
  );
}