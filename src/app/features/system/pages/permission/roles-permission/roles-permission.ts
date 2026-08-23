import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../../shared/translate/notification.service';
import { SystemRoles } from '../../../models/roles-permission.model';
import { SystemUser, MenuItem } from '../../../models/user-permission.model';
import { RolesPermissionInfoComponent } from './roles-permission-info/roles-permission-info';
import { RolesPermissionSafeComponent } from './roles-permission-safe/roles-permission-safe';
import { RolesPermissionService } from '../../../services/roles-premission.service';

@Component({
  selector: 'app-roles-permission',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RolesPermissionInfoComponent,
    RolesPermissionSafeComponent
  ],
  templateUrl: './roles-permission.html',
  styleUrls: ['./roles-permission.css']
})
export class RolesPermissionComponent implements OnChanges {
  @Input() selectedRole: SystemRoles | null = null;
  @Input() menuTree: MenuItem[] = [];
  @Input() rolesList: SystemRoles[] = [];
  @Input() allUsers: SystemUser[] = [];

  @Output() deleteRole = new EventEmitter<any>();
  @Output() selectRoleAfterSave = new EventEmitter<any>();
  @Output() saveChanges = new EventEmitter<void>();
  
  // 🟢 Output để báo cho component cha ngoài cùng cập nhật lại danh sách roles sau khi thêm/sửa thành công
  @Output() reloadRolesList = new EventEmitter<any>();

  private rolesPermissionService = inject(RolesPermissionService);
  private notificationService = inject(NotificationService);

  activeTab: 'info' | 'safe' | 'attribute' = 'info';

  switchTab(tab: 'info' | 'safe' | 'attribute') {
    this.activeTab = tab;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedRole']) {
      //console.log('📌 Dữ liệu selectedRole nhận từ component cha:', changes['selectedRole'].currentValue);
    }
  }
  /**
   * Xử lý lưu thông tin vai trò (Thêm mới hoặc Cập nhật) từ tab Info
   */
  onSaveRole(savedData: any) {
    //console.log('💾 Dữ liệu lưu nhận từ form info:', savedData);
    // Chuẩn bị DTO gửi lên Backend khớp với cấu trúc bạn thiết kế
    const payload = {
      roleId: savedData.isNew ? null : (this.selectedRole?.ROLE_ID || savedData.roleId),
      roleNo: savedData.roleNo,
      roleName: savedData.roleName,
      roleDescription: savedData.roleDesc
    };

    // Gọi API lưu xuống Backend
    this.rolesPermissionService.saveRoles(payload).subscribe({
      next: (response: any) => {
        //console.log('✅ Lưu thành công:', response);
        this.notificationService.showSuccess(response.message || 'Lưu thông tin nhóm thành công!');

        // 1. Phát sự kiện yêu cầu component cha lớn nhất tải lại danh sách bên trái
        this.reloadRolesList.emit(response.data?.roleId || payload.roleNo);
      },
      error: (error) => {
        console.error('❌ Lỗi khi lưu vai trò:', error);
        this.notificationService.showError(error.error?.message || 'Có lỗi xảy ra khi lưu thông tin.');
      }
    });
  }

  /**
   * Xử lý lưu phân quyền chi tiết (Tab Safe) nếu bạn muốn gộp luôn tại đây
   */
  onSaveRoleSafe(safeData: any) {
    this.rolesPermissionService.saveRolesafe(safeData).subscribe({
      next: (response: any) => {
        this.notificationService.showSuccess(response.message || 'Lưu quyền hạn thành công!');
      },
      error: (error) => {
        this.notificationService.showError(error.error?.message || 'Lỗi khi lưu phân quyền.');
      }
    });
  }

  async onDeleteRole(role: any) {
    const roleId = role.ROLE_ID || role.roleId;
    if (!roleId) {
      this.notificationService.showError('Không tìm thấy mã định danh của nhóm quyền!');
      return;
    }

    const roleName = role.ROLE_NAME || role.roleName;

    // 🟢 Gọi hàm showConfirm với thông điệp và truyền tham số tên nhóm vào mảng params
    const isConfirmed = await this.notificationService.showConfirm(
      'Bạn có chắc chắn muốn xóa nhóm quyền "{0}" không?', // Hoặc key i18n tương ứng trong hệ thống dịch của bạn
      [roleName]
    );

    // Nếu người dùng bấm Xác nhận (True)
    if (isConfirmed) {
      this.rolesPermissionService.deleteRole(roleId).subscribe({
        next: (response: any) => {
          this.notificationService.showSuccess(response.message || 'Xóa nhóm quyền thành công!');
          this.reloadRolesList.emit(); 
        },
        error: (error) => {
          console.error('Lỗi khi xóa vai trò:', error);
          this.notificationService.showError(error.error?.message || 'Có lỗi xảy ra khi xóa nhóm quyền.');
        }
      });
    }
  }
}