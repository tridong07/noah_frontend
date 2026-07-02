import { useState } from 'react';

export const useAuthManager = () => {
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  const [resetData, setResetData] = useState({ username: "" });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const executeAuthAction = async (url: string, body: Record<string, any>, successMode?: "login" | "reset") => {
    if (isLoading) return;
    
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
        return null; // Trả về null nếu có lỗi để tránh undefined
      }
    } catch (error: any) {
      setMessage({ text: error.message, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Gọi API logout để Backend xóa cookie
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      // Chuyển hướng về login sau khi logout thành công
      window.location.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
      // Vẫn nên ép redirect nếu logout lỗi để tránh kẹt session
      window.location.replace("/login"); 
    } finally {
      setIsLoading(false);
    }
  };

  const changePasswordMutation = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
  if (newPassword !== confirmPassword) {
    setMessage({ text: "Mật khẩu mới không khớp!", isError: true });
    return;
  }
  return await executeAuthAction("change-password", { currentPassword, newPassword });
};

  return { mode, setMode, isLoading, message, resetData, setResetData, executeAuthAction, logout, changePasswordMutation };
};