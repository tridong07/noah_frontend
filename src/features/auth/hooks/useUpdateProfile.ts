import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from "@/context/NotificationContext";
import axios from 'axios';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { show } = useNotification();
  
  return useMutation({
    mutationFn: async (data: { name: string; phone: string; email: string }) => {
      // Axios tự động xử lý JSON và ném lỗi nếu response.status không nằm trong khoảng 2xx
      const { data: result } = await axios.post('/auth/update-profile', data);
      return result;
    },
    onSuccess: (data) => {
      show(data.message || 'Cập nhật thông tin thành công', "Thành công", "success");
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      // Axios lưu lỗi server trong error.response.data
      const message = error.response?.data?.message || error.message || 'Cập nhật thất bại';
      show(message, "Lỗi", "error");
    }
  });
};