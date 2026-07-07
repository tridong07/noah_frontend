'use client';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

interface UserGeneralFormProps {
  initialData?: any;
  action: 'view' | 'add' | 'edit';
  setAction: (action: 'view' | 'add' | 'edit') => void;
  onDelete: () => void;
}

export default function UserGeneralForm({ initialData, action, setAction, onDelete }: UserGeneralFormProps) {
  const { register, reset } = useFormContext();

  const isReadOnly = action === 'view';
  const isUserCodeDisabled = action === 'view' || action === 'edit';

  // Theo dõi sát sao: Nếu đang add mà initialData (User được chọn bên trái) thay đổi, lập tức huỷ add để xem User mới
  useEffect(() => {
    // ✨ ĐIỀU KIỆN SỬA LẠI: Chỉ tự động reset dữ liệu cũ nếu người dùng KHÔNG ở chế độ Thêm Mới
    if (initialData && action !== 'add') {
      setAction('view');
      reset({
        factory: initialData.FACT_NO ?? '',
        userCode: initialData.USER_NO ?? '', 
        userName: initialData.USER_NAME ?? '',
        password: initialData.USER_PWD ?? '', 
        confirmPassword: initialData.USER_PWD ?? '',
        email: initialData.USER_EMAIL ?? '',
        phone: initialData.TEL1 ?? initialData.TEL2 ?? '',
        gender: initialData.SEX ?? 'male',
        isAdmin: initialData.ADMIN_MK === 'Y',
        isSuspended: initialData.USE_STATUS === 'N'
      });
    }
  }, [initialData, reset, action]);

  // Khi bấm nút Thêm mới -> Xoá sạch form
  const handleAddNewClick = () => {
    setAction('add');
    reset({
      factory: '',
      userCode: '',
      userName: '',
      password: '',
      confirmPassword: '',
      email: '',
      phone: '',
      gender: 'male',
      isAdmin: false,
      isSuspended: false
    });
  };

  const SapInput = ({ label, name, required = false, type = "text", description = "", disabled = false }: any) => (
    <div className="flex items-center gap-4">
      <div className="w-44 flex items-center shrink-0">
        {required && <span className="text-red-500 font-bold mr-1">*</span>}
        <label className="text-sm font-medium text-foreground/80">{label}</label>
      </div>
      <div className="flex-1 flex items-center gap-3">
        <input 
          type={type}
          disabled={disabled}
          {...register(name)} 
          className="w-full max-w-md bg-transparent border-b border-border-subtle focus:border-sap-blue outline-none py-1 text-sm text-foreground transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {description && (
          <span className="text-xs text-foreground/40 font-normal hidden md:inline truncate">
            {description}
          </span>
        )}
      </div>
    </div>
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col justify-between p-6 space-y-8">
      {/* 🛠️ TOOLBAR ĐIỀU KHIỂN */}
      <div className="flex items-center justify-between border-b border-border-subtle/60 pb-4">
        <div className="flex items-center gap-2">
          {action === 'view' ? (
            <>
              <button
                type="button"
                onClick={handleAddNewClick}
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
              >
                Thêm mới
              </button>
              <button
                type="button"
                onClick={() => setAction('edit')}
                className="px-4 py-1.5 bg-sap-blue hover:bg-opacity-90 text-white rounded text-xs font-medium transition-colors"
              >
                Sửa thông tin
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
              >
                Xóa
              </button>
            </>
          ) : (
            <>
              <button
                type="submit"
                className="px-4 py-1.5 bg-sap-blue text-white rounded text-xs font-medium hover:bg-opacity-90 transition-colors shadow-sm"
              >
                {action === 'add' ? 'Xác nhận Thêm' : 'Cập nhật thay đổi'}
              </button>
              <button
                type="button"
                onClick={() => setAction('view')}
                className="px-4 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
              >
                Hủy bỏ
              </button>
            </>
          )}
        </div>
        <div className="text-xs font-medium px-2.5 py-1 rounded bg-black/10 dark:bg-white/10 text-foreground/70">
          Trạng thái: <span className="uppercase font-bold text-sap-blue">{action === 'view' ? 'Chỉ xem' : action === 'add' ? 'Đang thêm' : 'Đang sửa'}</span>
        </div>
      </div>

      {/* 📝 FORM INPUTS */}
      <div className="space-y-5 max-w-5xl">
        <SapInput label="Xưởng người dùng:" name="factory" required disabled={isReadOnly} description="Xưởng là xưởng đăng nhập." />
        <SapInput label="Mã người dùng:" name="userCode" required disabled={isUserCodeDisabled} />
        <SapInput label="Tên người dùng:" name="userName" required disabled={isReadOnly} />
        <SapInput label="Mật mã người dùng:" name="password" type="password" required disabled={isReadOnly} description="Mật mã người dùng không thể ít hơn 6 ký tự." />
        <SapInput label="Mật mã xác nhận:" name="confirmPassword" type="password" required disabled={isReadOnly} description="Mật mã xác nhận bắt buộc phải giống nhau." />
        <SapInput label="E_Mail:" name="email" disabled={isReadOnly} description="Xin nhập chính xác địa chỉ Email." />
        <SapInput label="Điện thoại liên hệ:" name="phone" disabled={isReadOnly} description="Xin nhập số điện thoại nội bộ." />
        
        <div className="flex flex-wrap items-center gap-x-12 gap-y-3 pt-4 border-t border-border-subtle/50 text-sm font-medium text-foreground/80">
          <div className="flex items-center gap-4">
            <span>Giới tính:</span>
            <label className="flex items-center gap-1.5 font-normal cursor-pointer">
              <input type="radio" value="male" disabled={isReadOnly} {...register("gender")} className="accent-sap-blue" /> Nam
            </label>
            <label className="flex items-center gap-1.5 font-normal cursor-pointer">
              <input type="radio" value="female" disabled={isReadOnly} {...register("gender")} className="accent-sap-blue" /> Nữ
            </label>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" disabled={isReadOnly} {...register("isAdmin")} className="w-4 h-4 rounded accent-sap-blue" /> Nhân viên quản lý
          </label>

          <label className="flex items-center gap-2 cursor-pointer bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded border border-yellow-500/20">
            <input type="checkbox" disabled={isReadOnly} {...register("isSuspended")} className="w-4 h-4 rounded accent-yellow-600" /> Đang đình chỉ sử dụng
          </label>
        </div>
      </div>

      {/* 📊 FOOTER (Ẩn khi đang thêm mới hoàn toàn) */}
      {action !== 'add' && (
        <div className="pt-4 border-t border-border-subtle/60 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 text-xs text-foreground/50 bg-black/5 p-4 rounded-lg">
          <div>ID người dùng: <span className="text-foreground/70 font-mono">{initialData?.USER_ID ?? '—'}</span></div>
          <div>Thời gian bắt đầu sử dụng: <span className="text-foreground/70">{formatDate(initialData?.PWD_START_DATE)}</span></div>
          <div>IP đăng nhập: <span className="text-foreground/70 font-mono">{initialData?.IP_ADDRESS ?? '—'}</span></div>
          <div>Thời hạn mật mã có hiệu lực: <span className="text-foreground/70">{formatDate(initialData?.PWD_STOP_DATE)}</span></div>
          <div>Người tạo tài khoản (ID): <span className="text-foreground/70">{initialData?.UPD_USER_ID ?? '—'}</span></div>
          <div>Ngày sửa mật mã: <span className="text-foreground/70">{formatDate(initialData?.PWD_CHANGE_DATE)}</span></div>
          <div>Mã người cập nhật cuối: <span className="text-foreground/70">{initialData?.UPD_USER_NO ?? '—'}</span></div>
          <div>Ngày sử dụng cuối (Login): <span className="text-foreground/70">{formatDate(initialData?.LOGIN_DATE)}</span></div>
          <div>Timestamp hệ thống: <span className="text-foreground/70 font-mono">{initialData?.UPD_TIMESTAMP ?? '—'}</span></div>
          <div className="col-span-2 md:col-span-3">Mô tả ngưng dùng tài khoản: <span className="text-foreground/70">{initialData?.STOP_NOTE ?? '—'}</span></div>
        </div>
      )}
    </div>
  );
}