import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SystemRoles, SaveRoleSafePayload, SaveRolePayload } from '../models/roles-permission.model';
import { MenuItem } from '../models/user-permission.model';

export interface RolePermissionState {
  selectedRoleId: number | null;
  selectedRoleName: string;
  isDirty: boolean;
}

const initialState: RolePermissionState = {
  selectedRoleId: null,
  selectedRoleName: '',
  isDirty: false
};

@Injectable({
  providedIn: 'root'
})
export class RolesPermissionService {
    private http = inject(HttpClient);
      
    // URL gốc của backend
    private apiUrl = environment.apiUrl;
    private baseUrl = `${this.apiUrl}/roles`;

    // Quản lý state tập trung để đồng bộ qua lại giữa các tab con
    private stateSubject = new BehaviorSubject<RolePermissionState>(initialState);
    public state$: Observable<RolePermissionState> = this.stateSubject.asObservable();

    // Đánh dấu role đang được chọn / thao tác
    selectRoleState(roleId: number, roleName: string = ''): void {
        this.stateSubject.next({
        selectedRoleId: roleId,
        selectedRoleName: roleName,
        isDirty: false
        });
    }

    markAsDirty(isDirty: boolean = true): void {
        const current = this.stateSubject.value;
        this.stateSubject.next({ ...current, isDirty });
    }

    resetState(): void {
        this.stateSubject.next(initialState);
    }

    /**
     * GET /api/v1/roles
     * Lấy danh sách nhóm trong hệ thống
     */
    getRoles(): Observable<SystemRoles[]> {
        return this.http.get<SystemRoles[]>(this.baseUrl);
    }

    getRoleSafeMenu(roleId: number): Observable<MenuItem[]> {
        return this.http.get<MenuItem[]>(`${this.baseUrl}/safe/${roleId}`);
    }

    saveRoles(saveRole:SaveRolePayload) : Observable<any> {
        return this.http.post(`${this.baseUrl}/save`, saveRole);
    }

    saveRolesafe(saveRoleSafe:SaveRoleSafePayload) : Observable<any> {
        return this.http.post(`${this.baseUrl}/save-safe`, saveRoleSafe);
    }

    deleteRole(roleId: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/delete/${roleId}`);
    }
}