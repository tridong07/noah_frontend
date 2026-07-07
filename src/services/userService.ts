import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userService = {
  // Lấy danh sách toàn bộ User
  getAll: () => api.get('/user').then(res => res.data),
  
  // Lấy chi tiết + Quyền hạn + Role (Kết hợp trong Hook)
  getRoles: (id: number) => api.get(`/user/roles/${id}`).then(res => res.data),
  getSafe: (id: number) => api.get(`/user/safe/${id}`).then(res => res.data),
  
  // Lưu
  saveUser: (data: any) => api.post('/user/save', data),
  saveSafe: (data: any) => api.post('/user/save-safe', data),
  saveRole: (data: any) => api.post('/user/save-role', data),
};