// features/auth/hooks/useUploadAvatar.ts
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

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const { show } = useNotification();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      // Lưu ý: với credentials: 'include', cookie session sẽ được gửi tự động
      const { data } = await api.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      return data;
    },
    onSuccess: (data) => {
      show(data.message || "Upload ảnh đại diện thành công", "Thành công", "success");
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Upload ảnh thất bại";
      show(message, "Lỗi", "error");
    }
  });
};