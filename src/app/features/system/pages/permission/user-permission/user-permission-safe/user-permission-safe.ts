import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { MenuItem } from '../../../../models/user-permission.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-permission-safe',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule // Cần thiết cho các thẻ input binding [(ngModel)]
  ],
  templateUrl: './user-permission-safe.html'
})
export class UserPermissionSafeComponent {
  @Input() selectedUser: any;
  @Input() menuTree: any[] = [];

  @Output() expandAll = new EventEmitter<void>();
  @Output() collapseAll = new EventEmitter<void>();
  @Output() saveSafePermissions = new EventEmitter<void>();
  @Output() toggleAllRow = new EventEmitter<any>();
  @Output() toggleNode = new EventEmitter<any>();

  private translate = inject(TranslateService);

  // Đưa hàm getSafeModuleName ra ngoài làm phương thức của Component để gọi trong HTML
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
    // Logic cập nhật trạng thái quyền con đã nằm trong hàm ở cha, 
    // ta chỉ việc phát tín hiệu (emit) cho cha xử lý
    this.toggleAllRow.emit(item);
  }

  // Xử lý đóng/mở thư mục
  onToggleNode(item: MenuItem): void {
    this.toggleNode.emit(item);
  }

  // Các hàm tiện ích để emit sự kiện ra ngoài
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