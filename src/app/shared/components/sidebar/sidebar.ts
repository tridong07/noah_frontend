import { Component, OnInit, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core'; 

import { AppLauncherService } from '../app-launcher/app-launcher.service';
import { SidebarItemComponent } from './components/sidebar-item/sidebar-item';
import { CrmMenuItem } from '../../models/crm-module.model';
import { WorkspaceTabService } from '../workspace-tab/workspace-tab.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    SidebarItemComponent,
    TranslatePipe 
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() collapsedChange = new EventEmitter<boolean>();

  sidebarSearchTerm: string = '';
  onlyShowFavorites: boolean = false;
  
  // 🟢 Biến quản lý trạng thái Ghim Sidebar (lưu vào localStorage để ghi nhớ lựa chọn của user)
  isPinned: boolean = localStorage.getItem('sidebar_pinned') === 'true';

  private langChangeSub!: Subscription;
  private stateSub!: Subscription;
  private readonly FAVORITE_STORAGE_KEY = 'erp_favorite_menus';

  public isCollapsed: boolean = localStorage.getItem('sidebar_collapsed') === 'true';

  constructor(
    public launcherService: AppLauncherService,
    private router: Router,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private workspaceTabService: WorkspaceTabService
  ) {}

  ngOnInit(): void {
    this.stateSub = this.launcherService.state$.subscribe(() => {
      this.sidebarSearchTerm = '';
      this.cdr.markForCheck();
    });

    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    if (this.stateSub) this.stateSub.unsubscribe();
    if (this.langChangeSub) this.langChangeSub.unsubscribe();
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    try {
      localStorage.setItem('sidebar_collapsed', String(this.isCollapsed));
    } catch (e) {
      console.warn('Lỗi lưu trạng thái sidebar', e);
    }
    this.collapsedChange.emit(this.isCollapsed);
  }

  // 🟢 1. Hàm bật/tắt trạng thái Ghim Sidebar
  togglePin(): void {
    this.isPinned = !this.isPinned;
    try {
      localStorage.setItem('sidebar_pinned', String(this.isPinned));
    } catch (e) {
      console.warn('Lỗi lưu trạng thái ghim sidebar', e);
    }
    this.cdr.markForCheck();
  }

  toggleFavoriteFilter(): void {
    this.onlyShowFavorites = !this.onlyShowFavorites;
    this.cdr.markForCheck();
  }

  get favoriteIds(): string[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(this.FAVORITE_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
      }
    } catch {
      return [];
    }
    return [];
  }

  getFilteredSubMenus(subMenus: CrmMenuItem[] | undefined | null): CrmMenuItem[] {
    let result = this.launcherService.getFilteredSubMenus(subMenus, this.sidebarSearchTerm) || [];

    if (!this.onlyShowFavorites) {
      return result;
    }

    const favorites = this.favoriteIds;

    const filterFavoriteNodes = (items: CrmMenuItem[]): CrmMenuItem[] => {
      return items
        .map(item => {
          const children = this.getChildren(item);
          if (children && children.length > 0) {
            const filteredChildren = filterFavoriteNodes(children);
            if (filteredChildren.length > 0) {
              return { ...item, children: filteredChildren, subMenus: filteredChildren, items: filteredChildren };
            }
          } else if (favorites.includes(String(item.id))) {
            return { ...item };
          }
          return null;
        })
        .filter((item): item is CrmMenuItem => item !== null);
    };

    return filterFavoriteNodes(result);
  }

  onFavoriteToggled(): void {
    this.cdr.markForCheck();
  }

  onSubMenuSelect(item: CrmMenuItem): void {
    const rawUrl = item.url?.trim();
    if (!rawUrl || rawUrl === '#' || rawUrl.startsWith('javascript:')) return;

    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      window.open(rawUrl, '_blank');
      return;
    }

    const cleanRoute = rawUrl.startsWith('/') ? rawUrl : '/' + rawUrl;
    const fullRoute = `/app${cleanRoute}`;
  
    // 🟢 Đăng ký mở tab vào Workspace
    this.workspaceTabService.openTab({
      id: fullRoute,
      title: this.launcherService.getTranslatedName(item) || item.name,
      route: fullRoute,
      menuItem: item
    });
    
    this.router.navigate([`/app${cleanRoute}`]).then(() => {
      // 🟢 THÔNG MINH HƠN: Chỉ tự động thu nhỏ nếu sidebar đang mở VÀ người dùng KHÔNG bật chế độ Ghim (isPinned = false)
      if (!this.isCollapsed && !this.isPinned) {
        this.toggleSidebar(); 
      }
    }).catch(err => {
      console.warn(`⚠️ Route /app${cleanRoute} chưa cấu hình`, err);
    });
  }
  
  countTotalNodes(items: CrmMenuItem[] | undefined | null): number {
    return this.launcherService.countTotalNodes(items);
  }

  clearSidebarSearch(): void {
    this.sidebarSearchTerm = '';
  }

  hasChildren(item: any): boolean {
    const children = item?.children || item?.subMenus || item?.items;
    return Array.isArray(children) && children.length > 0;
  }

  getChildren(item: any): any[] {
    return item?.children || item?.subMenus || item?.items || [];
  }

  trackByMenuId(index: number, item: CrmMenuItem): string | number {
    return item.id || index;
  }
}