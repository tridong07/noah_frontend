import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkspaceTabService, WorkspaceTab } from './workspace-tab.service';
import { TranslateService } from '@ngx-translate/core';
import { AppLauncherService } from '../app-launcher/app-launcher.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-workspace-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspace-tab.html',
  styleUrls: ['./workspace-tab.css']
})
export class WorkspaceTabsComponent implements OnInit, OnDestroy {
  private tabService = inject(WorkspaceTabService);
  private router = inject(Router);
  public translate = inject(TranslateService);
  public launcherService = inject(AppLauncherService);
  private cdr = inject(ChangeDetectorRef);
  private langSub!: Subscription;

  tabs$: Observable<WorkspaceTab[]> = this.tabService.tabs$;
  activeTabId$: Observable<string> = this.tabService.activeTabId$;

  // 🟢 Trạng thái đóng/mở dropdown danh sách tab
  isDropdownOpen = false;

  ngOnInit(): void {
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    if (this.langSub) this.langSub.unsubscribe();
  }

  // 🟢 Lắng nghe sự kiện click ra ngoài để tự động ẩn dropdown
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectTabFromDropdown(tab: WorkspaceTab) {
    this.switchTab(tab);
    this.isDropdownOpen = false;
  }

  closeTabFromDropdown(event: MouseEvent, tab: WorkspaceTab) {
    // Gọi lại hàm closeTab đã có logic check isDirty
    this.closeTab(event, tab);
  }

  getTabTitle(tab: WorkspaceTab): string {
    if (tab.menuItem) {
      const translated = this.launcherService.getTranslatedName(tab.menuItem);
      if (translated) return translated;
    }
    return tab.title;
  }

  switchTab(tab: WorkspaceTab) {
    this.tabService.setActiveTab(tab.id);
    this.router.navigate([tab.route]);
    this.isDropdownOpen = false;
  }

  closeTab(event: MouseEvent, tab: WorkspaceTab) {
    event.stopPropagation();
    
    if (tab.isDirty) {
      const confirmClose = confirm("Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn đóng tab này?");
      if (!confirmClose) return; // Hủy đóng nếu user không đồng ý
    }
    
    this.tabService.closeTab(tab.id, (nextRoute) => {
      this.router.navigate([nextRoute]);
    });
  }
}