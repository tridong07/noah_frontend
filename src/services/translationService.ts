
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const CACHE_KEY = 'app_translations_cache';
const VERSION_KEY = 'app_translations_version';

export const getTranslations = async (lang: 'vi' | 'en') => {
  try {
    // 1. Lấy phiên bản mới nhất từ Server (Request này cực nhẹ)
    const { data: versionData } = await api.get('/translations/version');
    const { version } = versionData;
    
    // 2. So sánh với phiên bản đang lưu trong máy người dùng
    const localVersion = localStorage.getItem(VERSION_KEY);

    if (localVersion === version) {
      // Nếu giống nhau, dùng luôn dữ liệu cũ -> Cực nhanh!
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached)[lang];
    }

    // 3. Nếu khác nhau (hoặc chưa có), tải toàn bộ từ vựng mới
    const { data } = await api.get('/translations');
    
    // Lưu vào localStorage và cập nhật version
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(VERSION_KEY, version);
    
    return data[lang];
  } catch (error) {
    console.error("Lỗi đồng bộ từ vựng:", error);
    // Vẫn dùng cache cũ nếu có lỗi mạng
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached)[lang] : null;
  }
};