import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { MenuItem } from '../../../../models/user-permission.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-roles-permission-safe',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule
  ],
  templateUrl: './roles-permission-safe.html',
  styleUrls: ['./roles-permission-safe.css']
})
export class RolesPermissionSafeComponent {
  // 🟢 Đổi tên hoặc bổ sung alias '@Input({ alias: 'role' })' hoặc dùng trực tiếp 'role'
  @Input() role: any; 
  
  // Giữ lại alias hoặc hỗ trợ thêm selectedUser nếu code cũ của bạn có nơi khác dùng
  @Input() set selectedUser(val: any) {
    this.role = val;
  }
  get selectedUser(): any {
    return this.role;
  }

  @Input() menuTree: any[] = [] ;

  @Output() expandAll = new EventEmitter<void>();
  @Output() collapseAll = new EventEmitter<void>();
  @Output() saveSafePermissions = new EventEmitter<void>();
  @Output() toggleAllRow = new EventEmitter<any>();
  @Output() toggleNode = new EventEmitter<any>();

  private translate = inject(TranslateService);

  getSafeModuleName(module: any | null | undefined): string {
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

  onToggleAllRow(item: MenuItem): void {
    this.toggleAllRow.emit(item);
  }

  onToggleNode(item: MenuItem): void {
    this.toggleNode.emit(item);
  }

  onExpandAll(): void {
    this.expandAll.emit();
  }

  onCollapseAll(): void {
    this.collapseAll.emit();
  }

  onSave(): void {
    this.saveSafePermissions.emit();
  }
}