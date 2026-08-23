import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { CrmMenuItem } from '../../../../models/crm-module.model';
import { TranslationService } from '../../../../../shared/translate/translation.service';

@Component({
  selector: 'app-sidebar-item',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarItemComponent // Tự import chính nó để hỗ trợ đệ quy
  ],
  templateUrl: './sidebar-item.html',
  styleUrls: ['./sidebar-item.css']
})
export class SidebarItemComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) item!: CrmMenuItem;
  @Input() searchTerm: string = '';
  @Output() menuSelect = new EventEmitter<CrmMenuItem>();
  @Output() favoriteToggle = new EventEmitter<void>();

  // =========================================================================
  // 1. INJECT SERVICES
  // =========================================================================
  private translationService = inject(TranslationService);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  private langSub!: Subscription;
  isExpanded: boolean = false;
  private readonly FAVORITE_STORAGE_KEY = 'erp_favorite_menus';

  // =========================================================================
  // 2. GETTER IS_ACTIVE (Sửa triệt để lỗi TS2339)
  // =========================================================================
  /**
   * Kiểm tra xem item hiện tại có trùng đường dẫn URL đang chạy hay không
   */
  get isActive(): boolean {
    if (!this.item) return false;

    // Lấy URL / Route của item (tùy theo cấu trúc Model của bạn: url, route, path,...)
    const itemUrl = (this.item as any).url || (this.item as any).route || (this.item as any).path;
    
    if (!itemUrl) return false;

    // So sánh đường dẫn hiện tại với đường dẫn của menu item
    return this.router.isActive(itemUrl, {
      paths: 'subset',
      queryParams: 'ignored',
      matrixParams: 'ignored',
      fragment: 'ignored'
    });
  }

  // =========================================================================
  // 3. FAVORITE LOGIC (YÊU THÍCH)
  // =========================================================================
  
  /**
   * Kiểm tra xem item hiện tại có nằm trong danh sách yêu thích không
   */
  get isFavorite(): boolean {
    if (!this.item || !this.item.id) return false;
    const favorites = this.getFavoritesFromStorage();
    return favorites.includes(String(this.item.id));
  }

  /**
   * Bật/Tắt trạng thái yêu thích
   */
  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation(); // Ngăn sự kiện click lan ra ngoài làm chuyển trang/mở menu

    if (!this.item || !this.item.id) return;

    const itemId = String(this.item.id);
    let favorites = this.getFavoritesFromStorage();

    if (favorites.includes(itemId)) {
      favorites = favorites.filter(id => id !== itemId);
    } else {
      favorites.push(itemId);
    }

    localStorage.setItem(this.FAVORITE_STORAGE_KEY, JSON.stringify(favorites));
    this.favoriteToggle.emit(); // Báo cho Component cha biết để cập nhật danh sách
    this.cdr.detectChanges();
  }

  private getFavoritesFromStorage(): string[] {
    try {
      const saved = localStorage.getItem(this.FAVORITE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // =========================================================================
  // 4. LIFECYCLE HOOKS
  // =========================================================================
  ngOnInit(): void {
    // Lắng nghe sự kiện đổi ngôn ngữ realtime
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.cdr.detectChanges(); 
    });

    // Tự động mở rộng Menu cha nếu menu con bên trong đang Active
    if (this.hasMatchingActiveChild(this.item)) {
      this.isExpanded = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm']) {
      const term = this.searchTerm?.toLowerCase().trim();
      if (term) {
        if (this.hasMatchingChild(this.item, term)) {
          this.isExpanded = true;
        }
      } else {
        // Tự động giữ mở nếu chứa child active khi xóa ô search
        this.isExpanded = this.hasMatchingActiveChild(this.item);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }

  // =========================================================================
  // 5. HELPER METHODS
  // =========================================================================

  /**
   * Helper tra cứu dịch tên Menu linh hoạt
   */
  getModuleName(module: CrmMenuItem | null | undefined): string {
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

  /**
   * Kiểm tra xem item hoặc các con của nó có active hay không (dùng để auto expand menu cha)
   */
  private hasMatchingActiveChild(item: CrmMenuItem): boolean {
    const children = this.getChildren(item);
    if (!children || children.length === 0) return false;

    return children.some(child => {
      const childUrl = child.url || child.route || child.path;
      const isChildActive = childUrl ? this.router.isActive(childUrl, {
        paths: 'subset',
        queryParams: 'ignored',
        matrixParams: 'ignored',
        fragment: 'ignored'
      }) : false;

      return isChildActive || this.hasMatchingActiveChild(child);
    });
  }

  /**
   * Kiểm tra item hoặc các con của nó có khớp với từ khóa tìm kiếm hay không
   */
  private hasMatchingChild(item: CrmMenuItem, term: string): boolean {
    if (!item) return false;
    
    const originalNameMatch = (item.name || '').toLowerCase().includes(term);
    const translatedNameMatch = this.getModuleName(item).toLowerCase().includes(term);
    const idMatch = String(item.id || '').toLowerCase().includes(term);

    if (originalNameMatch || translatedNameMatch || idMatch) return true;

    const children = this.getChildren(item);
    if (children && children.length > 0) {
      return children.some(child => this.hasMatchingChild(child, term));
    }
    return false;
  }

  // =========================================================================
  // 5. EVENT HANDLERS
  // =========================================================================
  toggleExpand(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.hasChildren(this.item)) {
      this.isExpanded = !this.isExpanded;
    } else {
      this.menuSelect.emit(this.item);
    }
  }

  onChildSelect(childItem: CrmMenuItem): void {
    this.menuSelect.emit(childItem);
  }

  onChildFavoriteToggle(): void {
    this.favoriteToggle.emit();
  }

  hasChildren(item: any): boolean {
    const children = item?.children || item?.subMenus || item?.items;
    return Array.isArray(children) && children.length > 0;
  }

  getChildren(item: any): any[] {
    return item?.children || item?.subMenus || item?.items || [];
  }

  trackByMenuId(index: number, item: any): string | number {
    return item?.id || item?.code || index;
  }
}