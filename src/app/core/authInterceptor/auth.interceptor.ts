import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, EMPTY } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = localStorage.getItem('access_token');

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token hết hạn hoặc không hợp lệ -> Xóa token và điều hướng về trang login
        localStorage.removeItem('access_token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
  /*
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
  );*/
};