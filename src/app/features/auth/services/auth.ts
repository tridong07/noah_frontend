import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

// DTO Request Đăng nhập
export interface LoginRequest {
  username: string;
  password: string;
}

// DTO Response Đăng nhập
export interface LoginResponse {
  success: boolean;
  message: string;
}

// DTO User Profile khớp 100% với GET /auth/me NestJS Response
export interface UserProfile {
  id: number;
  name: string;
  email: string | null;
  department: string | null;
  avatarUrl: string | null;
  role: string;
  [key: string]: any;
}

// DTO Cập nhật thông tin cá nhân
export interface UpdateProfileDto {
  name?: string;
  email?: string | null;
  phone?: string;
  [key: string]: any;
}

// DTO Đổi mật khẩu
export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * 🔑 POST /api/v1/auth/login
   * NestJS sẽ tự động set Cookie `sap_session_token` nhờ `withCredentials: true`
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials, {
      withCredentials: true
    });
  }

  /**
   * 📧 POST /api/v1/auth/forgot-password
   */
  requestPasswordReset(username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { username });
  }

  /**
   * 🔄 POST /api/v1/auth/reset-password
   */
  resetPassword(payload: { username: string; otp: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, payload);
  }

  /**
   * 👤 GET /api/v1/auth/me
   * Lấy Profile dựa trên JWT Cookie
   */
  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/auth/me`, {
      withCredentials: true
    });
  }

  /**
   * ✏️ POST /api/v1/auth/update-profile
   */
  updateProfile(data: UpdateProfileDto): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.apiUrl}/auth/update-profile`, data, {
      withCredentials: true
    });
  }

  /**
   * 🔒 POST /api/v1/auth/change-password
   */
  changePassword(data: ChangePasswordDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, data, {
      withCredentials: true
    });
  }

  /**
   * 🖼️ POST /api/v1/auth/upload-avatar
   */
  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<{ avatarUrl: string }>(
      `${this.apiUrl}/auth/upload-avatar`, 
      formData, 
      { withCredentials: true }
    );
  }

  /**
   * 🚪 POST /api/v1/auth/logout
   * Xóa Cookie phía Server & Dọn dẹp Storage ở Client
   */
  logout(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
      catchError((err) => {
        console.warn('⚠️ Lỗi khi gọi API logout từ server, tiến hành dọn dẹp client:', err);
        return of(null);
      })
    ).subscribe({
      next: () => {
        localStorage.clear();
        sessionStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}