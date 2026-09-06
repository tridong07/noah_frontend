import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { SystemPermissionService } from '../../services/user-permission.service';
import { SystemUser, UserRole, MenuItem } from '../../models/user-permission.model';
import { SidebarPermissionComponent } from './sidebar-permission/sidebar-permission';
import { UserPermissionComponent } from './user-permission/user-permission';
import { SystemRoles } from '../../models/roles-permission.model';
import { RolesPermissionService } from '../../services/roles-premission.service';
import { RolesPermissionComponent } from './roles-permission/roles-permission';
import { NotificationService } from '../../../../shared/translate/notification.service';

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarPermissionComponent, UserPermissionComponent, RolesPermissionComponent],
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})
export class PermissionComponent implements OnInit {
  public permissionService = inject(SystemPermissionService);
  public roleService = inject(RolesPermissionService);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);
  private notificationService = inject(NotificationService);

  activeTab: 'safe' | 'roles' = 'safe';
  selectedUserId: number | null = null;
  selectedUser: SystemUser | null = null;
  selectedRoleId: number | null = null;
  selectedRole : SystemRoles | null = null;
  selectedMenuId: string | null = null;
  activeSubTab: 'users' | 'roles' | 'menus' = 'users';
  selectedMenu: MenuItem | null = null;

  users: SystemUser[] = [];
  roles: SystemRoles[] = [];
  usersRoles: UserRole[] = [];
  menuTree: MenuItem[] = [];
  rolemenuTree: MenuItem[] = [];

  userSearchTerm: string = '';
  roleSearchTerm: string = '';

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();

    // Lắng nghe sự kiện đổi ngôn ngữ để ép giao diện cập nhật ngay lập tức
    this.translate.onLangChange.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  loadUsers(targetId?: number): void {
    const currentSelectedId = targetId !== undefined ? targetId : this.selectedUserId;
    this.permissionService.getUsers().subscribe({
      next: (data) => {
        this.users = [...data]; 
        this.cdr.detectChanges(); 

        if (this.users.length > 0) {
          if (currentSelectedId !== null && currentSelectedId !== undefined) {
            // Dùng Number() ở cả 2 vế để tránh lệch kiểu dữ liệu (Number vs String)
            const existingUser = this.users.find(u => Number(u.USER_ID) === Number(currentSelectedId));
            if (existingUser) {
              this.selectUser(existingUser);
              return;
            }
          }
          this.selectUser(this.users[0]);
        }
      },
      error: (err) => console.error('Lỗi khi tải danh sách người dùng:', err)
    });
  }

  selectUser(user: SystemUser): void {
    this.selectedUserId = user.USER_ID;
    this.selectedUser = user;
    this.loadUserData(user.USER_ID);
  }
  
  loadUserData(userId: number): void {
    this.permissionService.getUserSafeMenu(userId).subscribe({
      next: (menus) => {
        this.menuTree = menus; // Gán trực tiếp dữ liệu gốc
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Lỗi khi tải ma trận quyền Safe:', err)
    });

    this.permissionService.getUserRoles(userId).subscribe({
      next: (usersRoles) => {
        this.usersRoles = usersRoles;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Lỗi khi tải danh sách vai trò:', err)
    });
  }

  loadRoles(targetId?: number): void{
    const currentSelectedId = targetId !== undefined ? targetId : this.selectedRoleId;
    this.roleService.getRoles().subscribe({
      next: (data) =>{
        this.roles = [...data];
        this.cdr.detectChanges();
        //console.error("loadroles:", this.roles);
        if (this.roles.length > 0) {
          if (currentSelectedId !== null && currentSelectedId !== undefined) {
            // Dùng Number() ở cả 2 vế để tránh lệch kiểu dữ liệu (Number vs String)
            const existingRole = this.roles.find(u => Number(u.ROLE_ID) === Number(currentSelectedId));
            if (existingRole) {
              this.selectRoles(existingRole);
              return;
            }
          }
          this.selectRoles(this.roles[0]);
        }
      },
      error: (err) => console.error('Lỗi khi tải danh sách nhóm:', err)
    })
  }

  selectRoles(roles: SystemRoles): void{
    this.selectedRoleId = roles.ROLE_ID;
    this.selectedRole = roles;
    this.loadRolesData(roles.ROLE_ID);
  }

  loadRolesData(roleId: number){
    this.roleService.getRoleSafeMenu(roleId).subscribe({
      next: (menus) => {
        this.rolemenuTree = menus; // Gán trực tiếp dữ liệu gốc
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Lỗi khi tải ma trận quyền Safe nhóm:', err)
    });
  }

  // Các hàm khác giữ nguyên...
  get filteredUsers(): SystemUser[] {
    if (!this.userSearchTerm.trim()) return this.users;
    const term = this.userSearchTerm.toLowerCase();
    return this.users.filter(
      (u) =>
        u.USER_NAME?.toLowerCase().includes(term) ||
        u.USER_NO?.toLowerCase().includes(term) ||
        u.USER_EMAIL?.toLowerCase().includes(term)
    );
  }

  get filteredRoles(): UserRole[] {
    if (!this.roleSearchTerm.trim()) return this.usersRoles;
    const term = this.roleSearchTerm.toLowerCase();
    return this.usersRoles.filter((r) => r.ROLE_NAME.toLowerCase().includes(term));
  }

  toggleAllRow(item: MenuItem): void {
    const nextState = !item.view;
    if (item.sysHasView) item.view = nextState;
    if (item.sysHasAdd) item.add = nextState;
    if (item.sysHasEdit) item.edit = nextState;
    if (item.sysHasDelete) item.delete = nextState;
    if (item.sysHasPrint) item.print = nextState;
    if (item.sysHasRun) item.run = nextState;
    if (item.sysHasAdm) item.adm = nextState;
    item.all = nextState;
  }

  toggleRoleAssignment(role: UserRole): void {
    role.IS_ASSIGNED = role.IS_ASSIGNED === 1 ? 0 : 1;
  }

  saveData(): void {
    if (!this.selectedUserId) return;

    if (this.activeTab === 'safe') {
      this.permissionService
        .saveUserSafePermissions(this.selectedUserId, this.menuTree)
        .subscribe({
          next: () => this.notificationService.showSuccess('Lưu cấu hình phân quyền chi tiết (Safe) thành công!'),
          error: () => this.notificationService.showError('Lỗi khi lưu ma trận quyền!')
        });

    } else if (this.activeTab === 'roles') {
      if (!this.usersRoles.length) return;

      // 🟢 FIX: phải forkJoin + subscribe thì các request mới thực sự được gửi đi.
      // Trước đây chỉ .map() tạo ra mảng Observable rồi bỏ đó -> API không bao giờ chạy.
      const requests = this.usersRoles.map((r) =>
        this.permissionService.saveUserRoles(
          this.selectedUserId!,
          r.ROLE_ID,
          r.IS_ASSIGNED === 1 ? 1 : 0
        )
      );

      forkJoin(requests).subscribe({
        next: () => {
          this.notificationService.showSuccess('Đã cập nhật vai trò thành công!');
          this.loadUserData(this.selectedUserId!); // load lại danh sách role sau khi lưu
        },
        error: (err) => {
          console.error('Lỗi khi lưu vai trò:', err);
          this.notificationService.showError('Lỗi khi lưu vai trò. Vui lòng thử lại.');
        }
      });
    }
  }

  onUserSaved(event: any): void {
    const userId = event ? Number(event) : undefined;
    this.loadUsers(userId);
  }

  onUserSelected(user: SystemUser): void {
    this.selectUser(user);
  }

  onRoleSelected(role: SystemRoles): void {
    this.selectedRoleId = role.ROLE_ID;
    this.selectedRole = { ...role };
  }

  onRolesSaved(event: any): void {
    const roleId = event ? Number(event) : undefined;
    this.loadRoles(roleId);
  }

  onMenuSelected(menu: MenuItem): void {
    this.selectedMenuId = menu.id;
    this.selectedMenu = menu; // Lưu lại toàn bộ object menu để truyền sang sidebar
  }
}