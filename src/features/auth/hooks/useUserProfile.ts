import { useQuery } from '@tanstack/react-query';

interface UserApiResponse {
  id: number;
  shortname: string;
  phone?: string;
  email?: string;
  department?: string;
  role?: string;
}

export interface UserProfile {
  id: number;
  shortName: string; // Dùng để hiển thị trong Avatar (đã cắt ngắn)
  fullname: string;  // Tên đầy đủ để hiển thị cạnh Avatar
  phone?: string;
  email?: string;
  department?: string;
  role?: string;
}

export const useUserProfile = () => {
  return useQuery<UserProfile | null>({
    queryKey: ['userProfile'],
    queryFn: async (): Promise<UserProfile | null> => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: 'include',
      });
      
      if (response.status === 401) return null;
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data: UserApiResponse = await response.json();

      // Logic cắt ngắn chuỗi để không bị tràn Avatar
      const rawName = data.shortname || "Admin";
      let shortNameForAvatar = "";

      // Kiểm tra nếu là tiếng Trung/Nhật/Hàn (Unicode)
      if (/[\u4e00-\u9fa5]/.test(rawName)) {
        shortNameForAvatar = rawName.length > 1 ? rawName.slice(0, 1) : rawName;
      } else {
        // Tiếng Việt/Anh: lấy 2 ký tự đầu
        shortNameForAvatar = rawName.substring(0, 2).toUpperCase();
      }

      return {
        id: data.id,
        shortName: shortNameForAvatar,
        fullname: rawName, // Lưu tên đầy đủ để hiển thị bên cạnh
        phone: data.phone,
        email: data.email,
        department: data.department,
        role: data.role
      };
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};