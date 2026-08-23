import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {  SystemUser, UserRole, MenuItem, SaveUserRolePayload, SaveUserSafePayload, insertUpdateUserDto } from '../models/user-permission.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SystemPermissionService {
  private http = inject(HttpClient);
  
  // URL gốc của backend
  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}/user`;

  /**
   * GET /api/v1/user
   * Lấy danh sách người dùng trong hệ thống
   */
  getUsers(): Observable<SystemUser[]> {
    return this.http.get<SystemUser[]>(this.baseUrl);
  }

  /**
   * GET /api/v1/user/roles/{userId}
   * Lấy danh sách Role và trạng thái đã gán của User
   */
  getUserRoles(userId: number): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(`${this.baseUrl}/roles/${userId}`);
  }

  /**
   * GET /api/v1/user/safe/{userId}
   * Lấy cây Menu kèm trạng thái quyền chi tiết (Safe)
   */
  getUserSafeMenu(userId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/safe/${userId}`);
  }

  /**
   * POST /api/v1/user/save
   * Tạo mới hoặc Cập nhật thông tin chi tiết người dùng
   */
  saveUser(userPayload: insertUpdateUserDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/save`, userPayload);
  }

  /**
   * POST /api/v1/user/save-role
   * Lưu danh sách Role gán cho người dùng
   */
  saveUserRoles(userId: number, roleId: string | number, isAssigned: number): Observable<any> {
    const payload = { userId, roleId, isAssigned };
    return this.http.post(`${this.baseUrl}/save-role`, payload);
  }

  /**
   * POST /api/v1/user/save-safe
   * Thiết lập ma trận quyền chi tiết (Safe) cho người dùng
   */
  saveUserSafePermissions(userId: number, permissions: MenuItem[]): Observable<any> {
    const payload: SaveUserSafePayload = { userId, permissions };
    return this.http.post(`${this.baseUrl}/save-safe`, payload);
  }

  // Hàm xử lý URL Avatar tập trung tại Service
  getAvatarUrl(avatarPath?: string | null): string {
    if (!avatarPath) return 'assets/images/default-avatar.png';
    return avatarPath.startsWith('http') ? avatarPath : `${this.baseUrl}${avatarPath}`;
  }

  deleteUser(userId: number): Observable<any>{
    return this.http.delete<any>(`${this.baseUrl}/delete/${userId}`);
  }
}