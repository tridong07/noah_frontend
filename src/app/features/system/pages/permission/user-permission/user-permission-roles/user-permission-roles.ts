import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-permission-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-permission-roles.html'
})
export class UserPermissionRolesComponent {
  @Input() selectedUser: any;
  @Input() roles: any[] = [];

  @Output() saveRoles = new EventEmitter<{ roleId: string | number, isAssigned: number }[]>();

  // Hàm này sẽ được gọi khi bấm nút Lưu trên HTML
  onSave(): void {
    if (!this.selectedUser) return;

    // Lấy trạng thái từ mảng roles (dựa vào IS_ASSIGNED mà checkbox đang thay đổi trực tiếp)
    const rolePayloads = (this.roles || []).map((r: any) => ({
      roleId: r.ROLE_ID,
      isAssigned: r.IS_ASSIGNED === 1 ? 1 : 0
    }));

    // Bắn dữ liệu chuẩn ra component cha
    this.saveRoles.emit(rolePayloads);
  }
}