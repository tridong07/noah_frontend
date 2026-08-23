import { Component, OnInit, inject, ChangeDetectorRef, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { switchMap, catchError, of } from 'rxjs';

import { AuthService, LoginResponse, LoginRequest, UserProfile } from '../../services/auth';
import { TranslationService, LanguageItem } from '../../../../shared/translate/translation.service';
import { AppLauncherService } from '../../../../shared/components/app-launcher/app-launcher.service';
import { ThemeService } from '../../../../core/service/theme.service'; // <-- Import ThemeService (sửa path đúng với project của bạn)

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;

  // =========================================================================
  // 1. INJECT SERVICES
  // =========================================================================
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  private appLauncherService = inject(AppLauncherService);
  public themeService = inject(ThemeService); // <-- Inject ThemeService public để dùng ngoài HTML

  // =========================================================================
  // 2. KHỞI TẠO REACTIVE FORMS
  // =========================================================================
  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  forgotPasswordForm: FormGroup = this.fb.group({
    accountInfo: ['', Validators.required]
  });

  // =========================================================================
  // 3. STATE MANAGEMENT
  // =========================================================================
  languages: LanguageItem[] = [
    { code: 'VN', name: 'Tiếng Việt' },
    { code: 'EN', name: 'English' }
  ] as LanguageItem[];

  selectedLang = 'VN';
  isLangDropdownOpen = false;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  showForgotPasswordModal = false;
  isSubmittingForgot = false;
  forgotSuccessMessage = '';
  forgotErrorMessage = '';

  // =========================================================================
  // 4. LIFECYCLE HOOKS
  // =========================================================================
  ngOnInit(): void {
    // Ngôn ngữ
    const rawLang = this.translationService.getCurrentLang();
    const activeLang = (typeof rawLang === 'function' ? (rawLang as Function)() : rawLang) || 'VN';

    if (activeLang) {
      this.selectedLang = activeLang;
      this.translate.use(activeLang);
    }

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

  // =========================================================================
  // 5. XỬ LÝ DARK MODE (Gọi qua Service đồng bộ toàn app)
  // =========================================================================
  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  // =========================================================================
  // 6. XỬ LÝ DROPDOWN & KHÁC...
  // =========================================================================
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      this.isLangDropdownOpen &&
      this.dropdownContainer &&
      !this.dropdownContainer.nativeElement.contains(target)
    ) {
      this.isLangDropdownOpen = false;
      this.cdr.detectChanges();
    }
  }

  toggleLangDropdown(): void {
    this.isLangDropdownOpen = !this.isLangDropdownOpen;
    this.cdr.detectChanges();
  }

  selectLangFromDropdown(langCode: string): void {
    this.switchLang(langCode);
    this.isLangDropdownOpen = false;
  }

  getSelectedLangLabel(): string {
    const selected = this.languages.find(l => l.code?.toLowerCase() === this.selectedLang?.toLowerCase());
    return selected ? selected.code : this.selectedLang;
  }

  isLangActive(langCode: string): boolean {
    return langCode?.trim().toLowerCase() === this.selectedLang?.trim().toLowerCase();
  }

  switchLang(langCode: string): void {
    if (!langCode || this.selectedLang === langCode) return;
    this.selectedLang = langCode;
    this.translationService.switchLang(langCode);

    this.translate.use(langCode).subscribe({
      next: () => this.cdr.detectChanges(),
      error: (err) => console.error(`Không thể nạp bản dịch cho ngôn ngữ: ${langCode}`, err)
    });
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginRequest = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).pipe(
      switchMap(() => this.authService.getMe()),
      switchMap((profile: UserProfile) => {
        const rawUserId = profile?.id ?? (profile as any)?.USER_ID;
        const parsedId = Number(rawUserId);
        const userId = !isNaN(parsedId) && rawUserId !== null && rawUserId !== undefined ? parsedId : 1;

        return this.appLauncherService.loadMenuByUserId(userId).pipe(
          catchError((err) => {
            console.error('❌ Lỗi tải Menu:', err);
            return of(null); 
          })
        );
      })
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.appLauncherService.openLauncher();
        this.router.navigate(['/app']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!';
        this.cdr.detectChanges();
      }
    });
  }

  openForgotPasswordModal(event: Event): void {
    event.preventDefault();
    this.showForgotPasswordModal = true;
    this.forgotSuccessMessage = '';
    this.forgotErrorMessage = '';
    this.forgotPasswordForm.reset();
  }

  closeForgotPasswordModal(): void {
    this.showForgotPasswordModal = false;
  }

  onForgotPasswordSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmittingForgot = true;
    this.forgotSuccessMessage = '';
    this.forgotErrorMessage = '';

    const accountInfo = this.forgotPasswordForm.value.accountInfo;

    this.authService.requestPasswordReset(accountInfo).subscribe({
      next: (res) => {
        this.isSubmittingForgot = false;
        this.forgotSuccessMessage = res?.message || 'Hướng dẫn khôi phục mật khẩu đã được gửi!';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmittingForgot = false;
        this.forgotErrorMessage = err.error?.message || 'Không tìm thấy thông tin tài khoản!';
        this.cdr.detectChanges();
      }
    });
  }
}