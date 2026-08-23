import { Component, Input, Output, EventEmitter, inject, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemUser, UserRole, MenuItem, insertUpdateUserDto } from '../../../models/user-permission.model';
import { SystemPermissionService } from '../../../services/user-permission.service';
import { NotificationService } from '../../../../../shared/translate/notification.service';

// Import các component đã tách
import { UserPermissionInfoComponent } from './user-permission-info/user-permission-info';
import { UserPermissionRolesComponent } from './user-permission-roles/user-permission-roles';
import { UserPermissionSafeComponent } from './user-permission-safe/user-permission-safe';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'app-user-permission',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    UserPermissionInfoComponent, 
    UserPermissionRolesComponent, 
    UserPermissionSafeComponent
  ],
  templateUrl: './user-permission.html',
  styleUrls: ['./user-permission.css']
})
export class UserPermissionComponent {
  // Inputs
  @Input() avatarBaseUrl: string = 'http://localhost:3000';
  @Input() selectedUser: SystemUser | null = null;
  @Input() menuTree: MenuItem[] = [];
  @Input() roles: UserRole[] = [];
  @Input() allUsers: SystemUser[] = [];
  
  @Output() saveChanges = new EventEmitter<any>();

  // State variables
  isNewUser: boolean = false;
  isEditing: boolean = false;
  activeDetailTab: 'info' | 'safe' | 'roles' = 'info';
  
  private originalUserBackup: SystemUser | null = null;
  private permissionService = inject(SystemPermissionService);
  private notificationService = inject(NotificationService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['menuTree'] && this.menuTree) {
      this.initMenuExpansion(this.menuTree);
    }
  }

  // --- Logic dùng chung cho cây Menu (TAB SAFE) ---
  private initMenuExpansion(items: MenuItem[]): void {
    items?.forEach(item => {
      if (item.isFolder && item.expanded === undefined) item.expanded = true;
      ['all', 'view', 'add', 'edit', 'delete', 'adm', 'print', 'reprn', 'man'].forEach(key => {
        if ((item as any)[key] === undefined) (item as any)[key] = false;
      });
      if (item.children?.length) this.initMenuExpansion(item.children);
    });
  }

  // --- HÀM XỬ LÝ SỰ KIỆN TỪ TAB SAFE (Delegated) ---
  toggleAllRow(item: MenuItem): void {
    const nextState = !!item.all;
    Object.assign(item, { view: nextState, add: nextState, edit: nextState, delete: nextState, adm: nextState, print: nextState, reprn: nextState, man: nextState });
  }

  toggleNode(item: MenuItem): void {
    item.expanded = !item.expanded;
  }

  expandAll(): void { this.setAllNodesExpansion(this.menuTree, true); }
  collapseAll(): void { this.setAllNodesExpansion(this.menuTree, false); }

  private setAllNodesExpansion(items: MenuItem[], expand: boolean): void {
    items.forEach(item => {
      item.expanded = expand;
      if (item.children?.length) this.setAllNodesExpansion(item.children, expand);
    });
  }

  // --- HÀM XỬ LÝ SỰ KIỆN TỪ TAB INFO (Delegated) ---
  onAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (file && this.selectedUser) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.selectedUser!.USER_AVATAR_URL = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  startCreate(): void {
    this.isNewUser = true;
    this.isEditing = true;
    this.activeDetailTab = 'info';
    this.originalUserBackup = this.selectedUser;
    this.selectedUser = { USER_ID: 0, USER_NO: '', USER_NAME: '' } as unknown as SystemUser;
  }

  startEdit(): void {
    if (!this.selectedUser) return;
    this.isNewUser = false;
    this.isEditing = true;
    this.originalUserBackup = JSON.parse(JSON.stringify(this.selectedUser));
  }

  cancelAction(): void {
    this.isEditing = false;
    if (this.isNewUser) this.selectedUser = this.originalUserBackup;
    else if (this.originalUserBackup) Object.assign(this.selectedUser!, this.originalUserBackup);
    this.isNewUser = false;
    this.originalUserBackup = null;
  }

  // --- GỌI API (Business Logic chính) ---
  saveUserChanges(): void {
    if (!this.selectedUser) return;
    const dto: insertUpdateUserDto = { 
      userId: (this.selectedUser?.USER_ID && this.selectedUser.USER_ID !== 0) ? this.selectedUser.USER_ID : null,
      factNo: this.selectedUser.FACT_NO || 'ALL',
      userNo: this.selectedUser.USER_NO || '',
      userName: this.selectedUser.USER_NAME || '',
      userPwd: this.selectedUser.USER_PWD || '', // Đảm bảo mật khẩu không trống và >= 6 ký tự
      userSex: this.selectedUser.SEX || 'M',
      userEmail: this.selectedUser.USER_EMAIL || '',
      userTel: this.selectedUser.TEL1 || '',
      userStatus: this.selectedUser.USE_STATUS || 'N',
      adminMk: this.selectedUser.ADMIN_MK || 'N',
      deptId: this.selectedUser.DEPT_ID || null } as any;

    this.permissionService.saveUser(dto).subscribe({
      next: (response: any) => {
        this.notificationService.showSuccess('Lưu thành công!');
        this.isEditing = false;
        
        // Lấy USER_ID từ backend trả về (hoặc fallback về ID cũ nếu đang update)
        const savedUserId = response?.data?.userId || dto?.userId || this.selectedUser?.USER_ID;
        // Bắn ID này ra component cha để component cha load lại và focus đúng user
        this.saveChanges.emit(savedUserId);
      },
      error: (err) => {
        console.error('Lỗi khi lưu user:', err);
        this.notificationService.showError('Không thể lưu thông tin người dùng!');
      }
    });
  }

  saveSafePermissions(): void {
    if (!this.selectedUser) return;
    this.permissionService.saveUserSafePermissions(this.selectedUser.USER_ID, this.menuTree).subscribe({
      next: () => this.notificationService.showSuccess('Lưu phân quyền thành công!')
    });
  }

  saveUserRoles(rolePayloads: { roleId: string | number, isAssigned: number }[]): void {
    if (!this.selectedUser || !rolePayloads || !rolePayloads.length) {
      this.notificationService.showError('Không có dữ liệu vai trò để lưu!');
      return;
    }
    
    // Tạo mảng các request gọi API cho từng role
    const requests = rolePayloads.map(item => 
      this.permissionService.saveUserRoles(this.selectedUser!.USER_ID, item.roleId, item.isAssigned)
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.notificationService.showSuccess('Đã cập nhật vai trò thành công!');
        this.saveChanges.emit(); 
      },
      error: (err) => {
        console.error('Lỗi lưu role:', err);
        this.notificationService.showError('Lỗi khi lưu vai trò. Vui lòng thử lại.');
      }
    });
  }

  async onDeleteUser(user: any): Promise<void> {
    const userId = user.USER_ID || user.userId;
    if (!userId) {
      this.notificationService.showError('Không tìm thấy mã người dùng!');
      return;
    }

    const userName = user.USER_NAME || user.userName || user.USER_NO || '';

    // 🟢 Hiển thị hộp thoại xác nhận chuyên nghiệp với showConfirm
    const isConfirmed = await this.notificationService.showConfirm(
      'Bạn có chắc chắn muốn xóa người dùng "{0}" không?', 
      [userName]
    );

    // Nếu người dùng bấm Xác nhận
    if (isConfirmed) {
      this.permissionService.deleteUser(userId).subscribe({
        next: (response: any) => {
          this.notificationService.showSuccess(response.message || 'Xóa người dùng thành công!');
          // Gọi emit ra component cha lớn nhất để load lại sidebar danh sách user
          this.saveChanges.emit(); 
        },
        error: (err) => {
          console.error('Lỗi khi xóa người dùng:', err);
          this.notificationService.showError(err.error?.message || 'Không thể xóa người dùng này.');
        }
      });
    }
  }
}