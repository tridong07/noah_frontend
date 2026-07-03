import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface MenuNode {
  menuNo: string;
  upMenuNo: string;
  menuName: string;
  winNo?: string;
  iconName?: string;
  children: MenuNode[];
}

export function useMenuData() {
  return useQuery<MenuNode[]>({
    queryKey: ['menuTree'],
    queryFn: async () => {
      // Dùng instance api: tự động đính kèm cookies và sử dụng baseURL
      const { data } = await api.get<MenuNode[]>('/sys-menu');
      return data;
    },
    staleTime: 3600000, // 1 giờ
  });
}