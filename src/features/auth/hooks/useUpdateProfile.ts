import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; phone: string; email: string }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Cập nhật thất bại');
      return response.json();
    },
    onSuccess: () => {
      // Refresh lại cache profile sau khi update thành công
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });
};