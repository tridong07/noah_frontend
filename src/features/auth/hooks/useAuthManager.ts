import { useState } from 'react';

export const useAuthManager = () => {
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  const [resetData, setResetData] = useState({ username: "" });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const executeAuthAction = async (url: string, body: any, successMode?: "login" | "reset") => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/auth/${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message, isError: false });
        if (successMode) setMode(successMode);
        return data; // Đảm bảo có dòng return này!
      }else{
        setMessage({ text: data.message || "Có lỗi xảy ra", isError: true });
      }
    } catch (error: any) {
      setMessage({ text: error.message, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return { mode, setMode, isLoading, message, resetData, setResetData, executeAuthAction };
};