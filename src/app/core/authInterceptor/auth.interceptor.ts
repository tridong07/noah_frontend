import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, EMPTY } from 'rxjs';

export const withCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const cookieReq = req.clone({
    withCredentials: true,
  });

  return next(cookieReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isChangePasswordApi = req.url.includes('/auth/change-password');
      
      // 🟢 Bổ sung thêm điều kiện bỏ qua nếu là các API hệ thống /user/
      const isSystemUserApi = req.url.includes('/api/v1/user');

      // Nếu lỗi 401 VÀ KHÔNG PHẢI API change-password VÀ KHÔNG PHẢI API user -> Mới đá về Login
      if (error.status === 401 && !isChangePasswordApi && !isSystemUserApi) {
        console.warn('🔒 Session hết hạn! Đang chuyển hướng về trang Login...');

        localStorage.removeItem('user_info');
        sessionStorage.clear();
        router.navigate(['/login']);

        return EMPTY; 
      }

      // Quăng lỗi ra để component tự bắt và xử lý hiển thị
      return throwError(() => error);
    })
  );
};