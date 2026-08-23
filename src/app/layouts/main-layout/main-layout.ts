import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // 🟢 Import Router
import { RouterOutlet } from '@angular/router';
import { take } from 'rxjs';
import { AppLauncherService } from '../../shared/components/app-launcher/app-launcher.service';
import { AuthService, UserProfile } from '../../features/auth/services/auth';
import { HeaderComponent } from '../../shared/components/header/header';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar';
import { WorkspaceTabsComponent } from '../../shared/components/workspace-tab/workspace-tab';
import { WorkspaceTabService } from '../../shared/components/workspace-tab/workspace-tab.service'; // 🟢 Import WorkspaceTabService

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    HeaderComponent,
    SidebarComponent,
    WorkspaceTabsComponent
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  currentUser: UserProfile | null = null;
  isSidebarOpen: boolean = true;

  private workspaceTabService = inject(WorkspaceTabService);
  private router = inject(Router);

  constructor(
    private launcherService: AppLauncherService,
    private authService: AuthService
  ) {}

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  ngOnInit(): void {
    // 🟢 1. Khôi phục lại tab đang active khi F5 (Nếu có lưu trong localStorage)
    this.workspaceTabService.activeTabId$.pipe(take(1)).subscribe(activeId => {
      // Nếu có tab active và trình duyệt đang ở trang gốc layout (/app)
      if (activeId && (this.router.url === '/app' || this.router.url === '/app/')) {
        this.router.navigate([activeId]);
      }
    });
    // Gọi API lấy thông tin người dùng
    this.authService.getMe().subscribe({
      next: (profile) => {
        this.currentUser = profile;
        // Chuyển ID về dạng số, nếu null/undefined thì fallback về 0
        const userId = profile?.id ? Number(profile.id) : 0;
        
        // 🚀 Nạp danh sách Menu dựa trên UserId
        this.launcherService.loadMenuByUserId(userId).subscribe();
      },
      error: (err) => {
        console.warn('⚠️ [MainLayout] Không thể lấy thông tin profile user:', err);
        // Fallback: Vẫn nạp menu với userId mặc định = 0 để tránh F5 bị trắng Sidebar
        this.launcherService.loadMenuByUserId(0).subscribe();
      }
    });
  }
}