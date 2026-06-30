"use client";
import React, { useState } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { useTranslation } from "@/hooks/useTranslation"; // Giả định hook của bạn ở đây
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";

export default function AuthFormManager() {
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Các state cần thiết cho các form
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);

  const handleAuth = async (endpoint: string, payload: any, nextMode?: "login" | "reset") => {
    setIsLoading(true);
    setMessage(null);
    console.log("Payload gửi lên API:", JSON.stringify(payload));
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed");
      
      if (nextMode) setMode(nextMode);
      setMessage({ text: data.message || "Success", type: "Positive" });

      console.log("login:", "thành công");
      if (nextMode) setMode(nextMode);
      else {
        // Chỉ đẩy về home nếu là thành công của login
        router.push("/home"); 
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Đăng nhập thất bại", type : "Negative" });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">

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