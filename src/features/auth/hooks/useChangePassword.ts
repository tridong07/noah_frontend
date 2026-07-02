import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
        credentials,
        { withCredentials: true }
      );
      return data;
    },
  });
};