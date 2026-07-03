import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from "@/context/NotificationContext";
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useChangePassword = () => {
  const { show } = useNotification();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: any) => {
      // Dùng instance api: không cần baseURL, không cần withCredentials thủ công
      const { data } = await api.post('/auth/change-password', credentials);
      return data;
    },
    onSuccess: (data) => {
      show(data.message || "Đổi mật khẩu thành công!", "Thành công", "success");
      // Nếu cần cập nhật lại thông tin user sau khi đổi mật khẩu
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Đổi mật khẩu thất bại!";
      show(message, "Lỗi", "error");
    }
  });
};