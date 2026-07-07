import { z } from 'zod';

export const userFormSchema = z.object({
  // Thông tin định danh
  userId: z.number().optional(), // Nullable khi tạo mới
  factNo: z.string().min(1, "Mã nhà máy là bắt buộc"),
  userNo: z.string().min(1, "Mã nhân viên là bắt buộc").max(15),
  userName: z.string().min(1, "Tên người dùng là bắt buộc"),
  
  // Thông tin bảo mật
  userPwd: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  
  // Thông tin cá nhân
  userSex: z.string().length(1, "Vui lòng chọn giới tính (M/F)"),
  userEmail: z.string().email("Email không hợp lệ").optional().or(z.literal('')),
  userTel: z.string().optional().or(z.literal('')),
  
  // Trạng thái và phân quyền hệ thống
  userStatus: z.string().length(1, "Trạng thái bắt buộc (Y/N)"),
  adminMk: z.string().length(1, "Quyền Admin (Y/N)"),
  deptId: z.number().min(1, "Vui lòng chọn phòng ban"),

  // Dữ liệu quyền hạn chi tiết (nếu form lưu chung)
  // Bạn có thể mở rộng schema này nếu muốn validate cả mảng roleIds
  roleIds: z.array(z.number()).optional(),
});

// Export kiểu dữ liệu TypeScript từ Schema (giúp viết code cực nhanh)
export type UserFormValues = z.infer<typeof userFormSchema>;