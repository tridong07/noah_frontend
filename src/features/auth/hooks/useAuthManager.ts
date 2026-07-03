import { useState } from 'react';
import { useNotification } from "@/context/NotificationContext";
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // QUAN TRỌNG: Đây chính là thay thế cho credentials: 'include'
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useAuthManager = () => {
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [isLoading, setIsLoading] = useState(false);
  const { show } = useNotification();
  const [resetData, setResetData] = useState({ username: "" });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const executeAuthAction = async (url: string, body: Record<string, any>, successMode?: "login" | "reset") => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const { data } = await api.post(`/auth/${url}`, body);

      show(data.message, "Thành công", "success");
      if (successMode) setMode(successMode);
      return data;
    } catch (error: any) {
      show(error.message, "Lỗi", "error");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Gọi API logout để Backend xóa cookie
      await api.post("/auth/logout", {}, { withCredentials: true });
      
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
    show("Mật khẩu mới không khớp!", "Lỗi", "error");
    return;
  }
  return await executeAuthAction("change-password", { currentPassword, newPassword });
};

  return { mode, setMode, isLoading, resetData, setResetData, executeAuthAction, logout, changePasswordMutation };
};