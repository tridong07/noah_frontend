// features/auth/hooks/useUploadAvatar.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      // Lưu ý: với credentials: 'include', cookie session sẽ được gửi tự động
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/upload-avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      
      return response.data; // Trả về { avatarUrl: '...' }
    },
    onSuccess: () => {
      // Làm mới dữ liệu profile sau khi upload thành công
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};