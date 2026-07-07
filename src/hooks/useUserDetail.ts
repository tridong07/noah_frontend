import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';

export const useUserDetail = (userId: number | null, win_no: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;

      // 1. Lấy dữ liệu danh sách tổng từ Cache (chấp nhận key có hoặc không có win_no)
      const allUsers = queryClient.getQueryData<any[]>(['users', win_no]) || 
                       queryClient.getQueryData<any[]>(['users', undefined]);
      
      // Khớp chính xác ID bằng chuỗi
      const detail = allUsers?.find(
        (user: any) => String(user.USER_ID) === String(userId)
      ) || null;

      // 2. Gọi API an toàn bằng cách dùng try-catch cho từng cái, tránh lỗi 401 làm sập form chính
      let roles = null;
      let safe = null;

      try {
        roles = await userService.getRoles(userId);
      } catch (err) {
        console.error("Lỗi tải API Roles (Có thể do chưa đăng nhập/401):", err);
      }

      try {
        safe = await userService.getSafe(userId);
      } catch (err) {
        console.error("Lỗi tải API Safe (Có thể do chưa đăng nhập/401):", err);
      }

      return { 
        detail, 
        roles, 
        safe 
      };
    },
    enabled: !!userId,
  });
};