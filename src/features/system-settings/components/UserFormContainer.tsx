'use client';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; 
import { useUserDetail } from '@/hooks/useUserDetail';
import { userService } from '@/services/userService';
import UserGeneralForm from './UserGeneralForm';
import UserRoleCheckbox from './UserRoleCheckbox';
import UserSafeTable from './UserSafeTable';
import { useParams } from 'next/navigation';

export default function UserFormContainer({ userId }: { userId: number }) {
  const params = useParams();
  const win_no = params.win_no as string;

  const { data, isLoading } = useUserDetail(userId, win_no);
  const detail = data?.detail;

  // Quản lý trạng thái Thêm/Sửa/Xem ở file Cha
  const [action, setAction] = useState<'view' | 'add' | 'edit'>('view');

  const methods = useForm({
    defaultValues: {
      factory: detail?.FACT_NO ?? '',
      userCode: detail?.USER_NO ?? '', 
      userName: detail?.USER_NAME ?? '',
      password: detail?.USER_PWD ?? '', 
      confirmPassword: detail?.USER_PWD ?? '',
      email: detail?.USER_EMAIL ?? '',
      phone: detail?.TEL1 ?? detail?.TEL2 ?? '',
      gender: detail?.SEX ?? 'male',
      isAdmin: detail?.ADMIN_MK === 'Y',
      isSuspended: detail?.USE_STATUS === 'N'
    }
  });

  const queryClient = useQueryClient();

  const onSubmit = async (formData: any) => {
    try {
      // 1. Chuẩn hóa dữ liệu gửi lên API: 
      // Nếu đang 'add' thì không gửi userId (hoặc truyền null/undefined), nếu 'edit' thì đính kèm userId vào payload
      const payload = action === 'edit' ? { ...formData, userId } : formData;

      // 🚀 GỌI MỘT API DUY NHẤT: Xử lý thông minh cho cả Add/Edit ở phía Backend
      await userService.saveUser(payload);

      // 2. Hiển thị thông báo động dựa trên hành động hiện tại
      if (action === 'add') {
        alert('Thêm mới nhân viên thành công!');
      } else {
        alert('Cập nhật thông tin thành công!');
      }
      
      // 3. Quay về chế độ xem và làm mới bộ nhớ cache dữ liệu
      setAction('view');
      queryClient.invalidateQueries({ queryKey: ['users', win_no] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu người dùng:", error);
      alert('Đã xảy ra lỗi trong quá trình lưu dữ liệu.');
    }
  };

  const handleDelete = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await userService.deleteUser(userId);
        alert('Xóa thành công!');
        queryClient.invalidateQueries({ queryKey: ['users', win_no] });
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (isLoading || (!detail && action !== 'add')) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-sm text-foreground/50 animate-pulse">
        Đang đồng bộ dữ liệu từ hệ thống...
      </div>
    );
  }

  return (
    <FormProvider {...methods} key={String(userId) + action}>
      {/* 🌟 GIẢI PHÁP: Sử dụng thẻ div bọc ngoài cùng để gánh toàn bộ class giao diện */}
      <div className="bg-card-bg p-6 rounded-lg border border-border-subtle w-full">
        
        {/* Thẻ Tabs nguyên bản của Radix / Shadcn - Không truyền className vào đây để tránh lỗi TypeScript */}
        <Tabs defaultValue="general">
          
          {/* Thanh chứa tiêu đề các Tab - giữ nguyên CSS gốc của bạn */}
          <TabsList className="bg-transparent border-b border-border-subtle rounded-none w-full justify-start h-auto p-0 gap-6 mb-6">
            <TabsTrigger value="general" className="data-[state=active]:border-sap-blue data-[state=active]:text-sap-blue border-b-2 border-transparent rounded-none px-2 py-3 bg-transparent font-medium text-sm transition-all">
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="role" className="data-[state=active]:border-sap-blue data-[state=active]:text-sap-blue border-b-2 border-transparent rounded-none px-2 py-3 bg-transparent font-medium text-sm transition-all">
              Quyền nhóm
            </TabsTrigger>
            <TabsTrigger value="safe" className="data-[state=active]:border-sap-blue data-[state=active]:text-sap-blue border-b-2 border-transparent rounded-none px-2 py-3 bg-transparent font-medium text-sm transition-all">
              Quyền chi tiết
            </TabsTrigger>
          </TabsList>
          
          <div className="text-foreground">
            {/* 📝 Tab 1: Thông tin người dùng (Chỉ bọc form duy nhất ở đây) */}
            <TabsContent value="general" className="outline-none m-0">
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <UserGeneralForm 
                  initialData={detail} 
                  action={action}
                  setAction={setAction}
                  onDelete={handleDelete}
                />
              </form>
            </TabsContent>

            {/* 👥 Tab 2: Quyền nhóm */}
            <TabsContent value="role" className="outline-none m-0">
              <UserRoleCheckbox initialRoles={data?.roles} />
            </TabsContent>
            
            {/* 🛡️ Tab 3: Quyền chi tiết */}
            <TabsContent value="safe" className="outline-none m-0">
              <UserSafeTable initialSafe={data?.safe} />
            </TabsContent>
          </div>

        </Tabs>
      </div>
    </FormProvider>
  );
}