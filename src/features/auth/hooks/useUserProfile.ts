import { useQuery } from '@tanstack/react-query';
import { useNotification } from "@/context/NotificationContext";
import axios from 'axios';

interface UserApiResponse {
  id: number;
  shortname: string;
  phone?: string;
  email?: string;
  department?: string;
  avatarUrl?: string;
  role?: string;
}

export interface UserProfile {
  id: number;
  shortName: string; // Dùng để hiển thị trong Avatar (đã cắt ngắn)
  fullname: string;  // Tên đầy đủ để hiển thị cạnh Avatar
  phone?: string;
  email?: string;
  department?: string;
  avatarUrl?: string;
  role?: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // QUAN TRỌNG: Đây chính là thay thế cho credentials: 'include'
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useUserProfile = () => {
  const { show } = useNotification();
  
  return useQuery<UserProfile | null>({
    queryKey: ['userProfile'],
    queryFn: async (): Promise<UserProfile | null> => {
      const { data } = await api.get<UserApiResponse>('/auth/me');

      // Logic cắt ngắn chuỗi để không bị tràn Avatar
      const rawName = data.shortname || "Admin";
      const shortNameForAvatar = /[\u4e00-\u9fa5]/.test(rawName) 
        ? rawName.slice(0, 1) 
        : rawName.substring(0, 2).toUpperCase();

      return {
        id: data.id,
        shortName: shortNameForAvatar,
        fullname: rawName, // Lưu tên đầy đủ để hiển thị bên cạnh
        avatarUrl: data.avatarUrl, // Lưu URL avatar nếu có
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