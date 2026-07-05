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
  
  const { mode, setMode, isLoading, executeAuthAction } = useAuthManager();
  
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleAuth = async (endpoint: string, payload: any, nextMode?: "login" | "reset") => {
    const data = await executeAuthAction(endpoint, payload, nextMode);
    if (data && endpoint === 'login') {
      window.location.href = "/home";
    }
  };

  return (
    /* Thêm transition-colors để khi chuyển giữa các form (nếu có hiệu ứng background), 
       nó sẽ mượt mà theo hệ thống theme của globals.css */
    <div className="w-full max-w-sm mx-auto transition-colors duration-300">
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