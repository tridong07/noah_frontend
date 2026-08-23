import { Component, Input, ElementRef, HostListener, OnInit, OnDestroy, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { AppLauncherComponent } from '../app-launcher/app-launcher';
import { AppLauncherService } from '../app-launcher/app-launcher.service';
import { AuthService, UserProfile, UpdateProfileDto, ChangePasswordDto } from '../../../features/auth/services/auth';
import { CrmMenuItem } from '../../models/crm-module.model';
import { TranslationService, LanguageItem } from '../../../shared/translate/translation.service';
import { ThemeService } from '../../../core/service/theme.service';
import { NotificationService } from '../../translate/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, AppLauncherComponent],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  /** Tham chiếu tới container của Dropdown Ngôn ngữ để xử lý Click Outside */
  @ViewChild('langDropdownContainer') langDropdownContainer!: ElementRef;

  @Input() currentUser: UserProfile | null = null;

  constructor(
    public themeService: ThemeService // Inject Service
  ) {}
  
  // =========================================================================
  // 1. INJECT SERVICES
  // =========================================================================
  private translationService = inject(TranslationService);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private eRef = inject(ElementRef);
  public launcherService = inject(AppLauncherService);

  private langSub!: Subscription;
  private notificationService = inject(NotificationService);

  // =========================================================================
  // 2. STATE MANAGEMENT
  // =========================================================================
  searchTerm: string = '';
  isUserMenuOpen: boolean = false;
  isProfileModalOpen: boolean = false;
  isChangePassModalOpen: boolean = false;
  isLoading: boolean = false;
  imageError = false; // Biến đánh dấu ảnh bị lỗi
  modalImageError = false; // Biến đánh dấu ảnh trong modal bị lỗi

  /** Trạng thái Ẩn/Hiện của Dropdown Ngôn ngữ trên Header */
  isLangDropdownOpen: boolean = false;

  // Form Models
  profileForm: UpdateProfileDto = { name: '', email: '' };
  changePassForm: ChangePasswordDto = { currentPassword: '', newPassword: '', confirmPassword: '' };

  selectedAvatarFile: File | null = null;
  avatarPreviewUrl: string | null = null;

  /** Danh sách ngôn ngữ hệ thống (Fallback mặc định) */
  languages: LanguageItem[] = [
    { code: 'VN', name: 'Tiếng Việt' },
    { code: 'EN', name: 'English' }
  ] as LanguageItem[];

  /** Mã ngôn ngữ đang chọn */
  selectedLang = 'VN';

  // =========================================================================
  // 3. LIFECYCLE HOOKS
  // =========================================================================
  
  // Hàm gọi khi ảnh tải thất bại (404, invalid URL,...)
  onAvatarError(): void {
    this.imageError = true;
  }

  // 2. Hàm gọi khi ảnh trong Modal bị lỗi
  onModalAvatarError(): void {
    this.modalImageError = true;
  }

  ngOnInit(): void {
    if (!this.currentUser) {
      this.loadUserProfile();
    }

    // 3.1. Đồng bộ Ngôn ngữ đã lưu
    const currentLangValue = this.translationService.getCurrentLang();
    const activeLang = (typeof currentLangValue === 'function' 
      ? (currentLangValue as Function)() 
      : currentLangValue) || this.translate.currentLang || 'VN';

    this.selectedLang = activeLang;

    // Nạp từ điển Menu ban đầu khi vừa vào/F5 trang
    this.translationService.switchLang(activeLang);

    // 3.2. Lắng nghe sự kiện đổi ngôn ngữ toàn hệ thống để cập nhật lại UI
    this.langSub = this.translate.onLangChange.subscribe((event) => {
      this.selectedLang = event.lang;
      this.cdr.detectChanges(); // Re-render giao diện làm tươi cả text static lẫn menu
    });

    // 3.3. Lấy danh sách ngôn ngữ khả dụng từ API
    this.translationService.getLanguages().subscribe({
      next: (res: any) => {
        const rawLangs = Array.isArray(res) ? res : res?.data || res?.items || [];
        
        if (rawLangs.length > 0) {
          this.languages = rawLangs.map((item: any) => ({
            ...item,
            code: item.LANG_NO || item.code,
            name: item.LANG_NAME || item.name || item.LANG_NO || item.code
          }));
        }
        
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Lỗi khi tải danh sách ngôn ngữ:', err)
    });
  }

  ngOnDestroy(): void {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }

  // Auto close User Menu & Lang Dropdown khi click ra ngoài
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    const target = event.target as HTMLElement;

    // Đóng User Dropdown Menu
    if (!this.eRef.nativeElement.contains(target)) {
      this.isUserMenuOpen = false;
    }

    // Đóng Language Dropdown Menu
    if (
      this.isLangDropdownOpen &&
      this.langDropdownContainer &&
      !this.langDropdownContainer.nativeElement.contains(target)
    ) {
      this.isLangDropdownOpen = false;
      this.cdr.detectChanges();
    }
  }

  // =========================================================================
  // 4. XỬ LÝ CHUYỂN ĐỔI NGÔN NGỮ (TEXT STATIC + MENU DYNAMIC)
  // =========================================================================

  private loadMenuTranslation(langCode: string): void {
    if (!langCode) return;
    this.translationService.getMenuTranslations(langCode).subscribe({
      next: (res) => {
        //console.log(`✅ [Header] Đã nạp từ điển Menu cho [${langCode}]`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(`❌ [Header] Lỗi nạp từ điển Menu cho [${langCode}]:`, err);
      }
    });
  }

  toggleLangDropdown(): void {
    if (!this.isLangDropdownOpen) {
      this.isUserMenuOpen = false;
      this.launcherService.closeLauncher(); // nếu có dùng Launcher Service
    }
    this.isLangDropdownOpen = !this.isLangDropdownOpen;
    this.cdr.detectChanges();
  }

  selectLangFromDropdown(langCode: string): void {
    this.switchLang(langCode);
    this.isLangDropdownOpen = false;
  }

  /**
   * Đổi ngôn ngữ chính xác: Vừa kích hoạt ngx-translate cho Text static, 
   * vừa nạp từ điển Menu dynamic qua API
   */
  switchLang(langCode: string): void {
    if (!langCode || this.selectedLang === langCode) return;
    
    this.selectedLang = langCode;

    // 🔴 DUY NHẤT 1 DÒNG NÀY: TranslationService sẽ dùng forkJoin gọi cả 2 API tĩnh + menu
    this.translationService.switchLang(langCode);
  }

  getSelectedLangLabel(): string {
    const selected = this.languages.find(
      l => l.code?.toLowerCase() === this.selectedLang?.toLowerCase()
    );
    
    // Lấy giá trị mã ngôn ngữ và ép thành chữ IN HOA (VI, EN, JA...)
    const label = selected ? selected.code : (this.selectedLang || 'VI');
    return label.toUpperCase();
  }

  isLangActive(langCode: string): boolean {
    return langCode?.trim().toLowerCase() === this.selectedLang?.trim().toLowerCase();
  }

  // =========================================================================
  // 5. HELPER TRA CỨU DỊCH MODULE & RENDER TEXT / INITIALS
  // =========================================================================

  getModuleName(module: CrmMenuItem | null | undefined): string {
    if (!module || module.id === undefined || module.id === null) {
      return module?.name || '';
    }

    const rawId = String(module.id).trim(); // VD: "03.01" hoặc "701"
    
    // Loại bỏ tất cả dấu chấm, gạch ngang để lấy ID liền: "03.01" -> "0301"
    const cleanId = rawId.replace(/[\.\-\_]/g, ''); 
    
    // Lấy ID dạng số thuần túy: "0301" -> "301"
    const numericId = String(parseInt(cleanId, 10)); 

    // Danh sách đầy đủ tất cả các kiểu Key mà Backend có thể trả về:
    const keysToTry = [
      `MENU.${rawId}`,      // MENU.03.01
      `MENU.${cleanId}`,    // MENU.0301
      `MENU.${numericId}`,  // MENU.301
      rawId,                // 03.01
      cleanId,              // 0301
      numericId             // 301
    ];

    for (const key of keysToTry) {
      const translated = this.translate.instant(key);
      // Nếu tìm thấy bản dịch và bản dịch khác với chính Key đó
      if (translated && translated !== key) {
        return translated;
      }
    }

    // Fallback về tên mặc định nếu không tra ra Key nào
    return module.name;
  }

  getModuleInitials(name: string | undefined): string {
    if (!name) return 'M';
    const cleanName = name.replace(/^[【\[\(\{\s\d\.\-\_]+/g, '').trim();
    return cleanName.charAt(0).toUpperCase() || name.charAt(0).toUpperCase() || 'M';
  }

  // =========================================================================
  // 6. XỬ LÝ SEARCH BAR & APPLAUNCHER INTEGRATION
  // =========================================================================

  clearSearch(): void {
    this.searchTerm = '';
  }

  closeLauncher(): void {
    this.clearSearch();
    this.launcherService.closeLauncher();
  }

  onSelectModule(moduleId: string): void {
    this.launcherService.selectModule(moduleId);
    this.closeLauncher();
  }

  getFilteredModules(modules: CrmMenuItem[] | undefined | null): CrmMenuItem[] {
    return this.launcherService.getFilteredModules(modules, this.searchTerm);
  }

  /**
   * Lấy tên Module đang active và dịch tự động theo ngôn ngữ hiện tại
   */
  getActiveModuleName(): string {
    // Lấy activeModule hiện tại từ state
    const currentState = (this.launcherService as any).stateSubject?.value || null;
    const activeModule = currentState?.activeModule;

    if (!activeModule) {
      return this.translate.instant('SHARED.HEADER.BANNER.MODULE') || 'Phân hệ Hệ thống';
    }

    // Gọi hàm dịch đồng nhất của AppLauncherService
    const translatedName = this.launcherService.getTranslatedName?.(activeModule);
    
    return translatedName || activeModule.name || '';
  }

  // =========================================================================
  // 7. XỬ LÝ USER PROFILE / PASSWORD / LOGOUT
  // =========================================================================

  loadUserProfile(): void {
    this.authService.getMe().subscribe({
      next: (profile) => {
        this.currentUser = profile;
      },
      error: (err) => {
        //console.error('Không thể lấy thông tin người dùng:', err);
        this.notificationService.showError('Không thể lấy thông tin người dùng. Vui lòng thử lại.', err?.error?.message ? [err.error.message] : []);
      }
    });
  }

  toggleUserMenu(): void {
    if (!this.isUserMenuOpen) {
      this.isLangDropdownOpen = false;
      this.launcherService.closeLauncher(); // nếu có dùng Launcher Service
    }
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  openProfileModal(): void {
    this.isUserMenuOpen = false;
    this.profileForm = {
      name: this.currentUser?.name || '',
      email: this.currentUser?.email || ''
    };
    this.avatarPreviewUrl = this.currentUser?.avatarUrl || null;
    this.selectedAvatarFile = null;
    this.isProfileModalOpen = true;
  }

  closeProfileModal(): void {
    this.isProfileModalOpen = false;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedAvatarFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.avatarPreviewUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    this.isLoading = true;

    if (this.selectedAvatarFile) {
      this.authService.uploadAvatar(this.selectedAvatarFile).subscribe({
        next: () => {
          // Upload avatar xong thì tiếp tục submit thông tin form
          this.submitProfileUpdate();
        },
        error: (err) => {
          this.isLoading = false;
          const detailMsg = err?.error?.message;
          this.notificationService.showError('Không thể tải ảnh đại diện. Vui lòng thử lại.', detailMsg ? [detailMsg] : []);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.submitProfileUpdate();
    }
  }

  private submitProfileUpdate(): void {
    this.authService.updateProfile(this.profileForm).subscribe({
      next: (updatedProfile) => {
        // 1. Cập nhật dữ liệu profile vào state local
        this.currentUser = updatedProfile;
        this.isLoading = false;

        // 2. Reset trạng thái lỗi ảnh để hiển thị avatar mới
        this.imageError = false;
        this.modalImageError = false;

        // 3. Đóng modal profile
        this.closeProfileModal();

        // 4. Hiển thị thông báo cập nhật thành công
        this.notificationService.showSuccess('Cập nhật hồ sơ thành công!');

        // 5. Load lại profile từ API để đồng bộ dữ liệu chuẩn nhất trên Header/App
        this.loadUserProfile();

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        const detailMsg = err?.error?.message;
        this.notificationService.showError(
          'Không thể cập nhật hồ sơ. Vui lòng thử lại.',
          detailMsg ? [detailMsg] : []
        );
        this.cdr.detectChanges();
      }
    });
  }

  openChangePasswordModal(): void {
    this.isUserMenuOpen = false;
    this.changePassForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.isChangePassModalOpen = true;
  }

  closeChangePasswordModal(): void {
    this.isChangePassModalOpen = false;
    this.isLoading = false;
    this.changePassForm = { currentPassword: '', newPassword: '', confirmPassword: '' }; // Reset form
    this.cdr.detectChanges();
  }

  saveNewPassword(): void {
    if (this.changePassForm.newPassword !== this.changePassForm.confirmPassword) {
      this.notificationService.showError('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    this.isLoading = true;
    this.authService.changePassword(this.changePassForm).subscribe({
      next: () => {
        this.closeChangePasswordModal();
        this.notificationService.showSuccess('Đổi mật khẩu thành công!');
      },
      error: (err) => {
        console.error('Lỗi đổi mật khẩu:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
        const detailMsg = err?.error?.message;
        this.notificationService.showError('Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.', detailMsg ? [detailMsg] : []);
      }
    });
  }
  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  logout(): void {
    this.isUserMenuOpen = false;
    this.authService.logout();
  }
}