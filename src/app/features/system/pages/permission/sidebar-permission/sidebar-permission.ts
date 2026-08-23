import { Component, Input, Output, EventEmitter, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SystemUser, MenuItem } from '../../../models/user-permission.model';
import { SystemRoles } from '../../../models/roles-permission.model';

@Component({
  selector: 'app-sidebar-permission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar-permission.html',
  styleUrls: ['./sidebar-permission.css']
})
export class SidebarPermissionComponent {
  private translate = inject(TranslateService);

  @Input() users: SystemUser[] = [];
  @Input() roles: SystemRoles[] = [];
  private _menuTree: MenuItem[] = [];
  @Input() 
  set menuTree(value: MenuItem[]) {
    this._menuTree = value || [];
    this.setDefaultExpanded(this._menuTree); // Tự động đóng toàn bộ khi có dữ liệu mới
  }
  get menuTree(): MenuItem[] {
    return this._menuTree;
  }
  @Input() currentMenuNo?: string;
  @Input() currentMenuName?: string;
  @Input() selectedUserId: number | null = null;
  @Input() selectedRoleId: number | null = null;
  @Input() selectedMenuId: string | null = null;
  @Input() avatarBaseUrl: string = '';

  @Input() activeSubTab: 'users' | 'roles' | 'menus' = 'users';
  @Output() activeSubTabChange = new EventEmitter<'users' | 'roles' | 'menus'>();

  @Output() userSelected = new EventEmitter<SystemUser>();
  @Output() roleSelected = new EventEmitter<SystemRoles>();
  @Output() menuSelected = new EventEmitter<MenuItem>();

  searchTerm: string = '';

  changeTab(tab: 'users' | 'roles' | 'menus'): void {
    this.activeSubTab = tab;
    this.activeSubTabChange.emit(tab);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Nếu menuTree thay đổi qua @Input thông thường, đảm bảo gọi lại hàm xử lý
    if (changes['menuTree'] && changes['menuTree'].currentValue) {
      this.setDefaultExpanded(changes['menuTree'].currentValue);
    }
  }

  private setDefaultExpanded(nodes: any[]): void {
    if (!nodes || !Array.isArray(nodes)) return;
    nodes.forEach(node => {
      node.expanded = false; // Mặc định đóng
      if (node.children && node.children.length > 0) {
        this.setDefaultExpanded(node.children);
      }
    });
  }

  // Hàm dịch ngôn ngữ cho menu trong sidebar
  getModuleName(module: MenuItem | null | undefined): string {
    //console.log('--- getModuleName called with module:', module);
    if (!module || module.id === undefined || module.id === null) {
      return module?.name || '';
    }

    const rawId = String(module.id).trim();
    const cleanNumericId = String(parseInt(rawId, 10));

    const keysToTry = [
      `MENU.${rawId}`,
      `MENU.${cleanNumericId}`,
      rawId,
      cleanNumericId
    ];

    for (const key of keysToTry) {
      const translated = this.translate.instant(key);
      if (translated && translated !== key) {
        return translated;
      }
    }

    return module.name;
  }

  get filteredUsers(): SystemUser[] {
    if (!this.searchTerm.trim()) return this.users;
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(u => u.USER_NAME?.toLowerCase().includes(term) || u.USER_NO?.toLowerCase().includes(term));
  }

  get filteredRoles(): SystemRoles[] {
    if (!this.searchTerm.trim()) return this.roles;
    const term = this.searchTerm.toLowerCase();
    return this.roles.filter(r => r.ROLE_NAME?.toLowerCase().includes(term));
  }
}