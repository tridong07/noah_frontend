import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, forkJoin, firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { MenuTranslationService } from './menu-translation.service';
import { NotificationService } from './notification.service';

export interface LanguageItem {
  code: string;
  name: string;
  LANG_NO?: string;
  LANG_NAME?: string;
  flagIcon?: string;
  isDefault?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private http = inject(HttpClient);
  private translate = inject(TranslateService);
  private menuTranslationService = inject(MenuTranslationService);
  private notificationService = inject(NotificationService);

  private readonly fallbackLanguages: LanguageItem[] = [
    { code: 'VN', name: 'Tiếng Việt', LANG_NO: 'VN', LANG_NAME: 'Tiếng Việt', isDefault: true },
    { code: 'EN', name: 'English', LANG_NO: 'EN', LANG_NAME: 'English' }
  ];

  private languages$!: Observable<LanguageItem[]>;

  /**
   * 🟢 NẠP NGÔN NGỮ BAN ĐẦU KHI APP KHỞI CHẠY
   * Gọi hàm này ở AppComponent/AppInitializer để giải mã toàn bộ từ điển tĩnh & menu
   */
  async initLang(): Promise<void> {
    const savedLang = this.getCurrentLang();
    
    // Khai báo danh sách ngôn ngữ & ngôn ngữ mặc định dự phòng
    this.translate.addLangs(['VN', 'EN']);

    try {
      await firstValueFrom(
        forkJoin({
          staticText: this.translate.use(savedLang),
          menuText: this.menuTranslationService.getMenuTranslations(savedLang)
        })
      );
    } catch (err) {
      console.warn('[TranslationService] Lỗi nạp ngôn ngữ ban đầu:', err);
    }
  }
  
  getLanguages(): Observable<LanguageItem[]> {
    if (!this.languages$) {
      this.languages$ = this.http.get<LanguageItem[]>(`${environment.apiUrl}/translations/languages`).pipe(
        map((res: any) => {
          const rawLangs = Array.isArray(res) ? res : res?.data || res?.items || [];
          return rawLangs.map((item: any) => ({
            ...item,
            code: item.code || item.LANG_NO,
            LANG_NO: item.LANG_NO || item.code,
            name: item.name || item.LANG_NAME,
            LANG_NAME: item.LANG_NAME || item.name
          }));
        }),
        catchError((err) => {
          console.warn('[i18n] Lỗi tải danh sách ngôn ngữ, dùng danh sách dự phòng:', err);
          return of(this.fallbackLanguages);
        }),
        shareReplay(1)
      );
    }
    return this.languages$;
  }

  getCurrentLang(): string {
    const lang = typeof this.translate.currentLang === 'function'
      ? (this.translate.currentLang as any)()
      : this.translate.currentLang;

    return lang || localStorage.getItem('app_lang') || 'VN';
  }

  /**
   * 🟢 CHUYỂN ĐỔI NGÔN NGỮ ĐỒNG BỘ TẬP TRUNG
   * 1. Kích hoạt CustomTranslateHttpLoader tải từ điển Text Tĩnh (`/translations?lang=...`)
   * 2. Kích hoạt MenuTranslationService tải từ điển Menu Động (`/translations/menu-translations?lang=...`)
   */
  switchLang(langCode: string): void {
    if (!langCode) return;

    // Chạy song song cả 2 API nạp từ điển
    forkJoin({
      staticText: this.translate.use(langCode),
      menuText: this.menuTranslationService.getMenuTranslations(langCode)
    }).subscribe({
      next: () => {
        localStorage.setItem('app_lang', langCode);
      },
      error: (err) => {
        console.error(`[TranslationService] Lỗi khi đổi ngôn ngữ sang ${langCode}:`, err);
        localStorage.setItem('app_lang', langCode);
      }
    });
  }

  getMenuTranslations(lang: string, forceReload = false): Observable<Record<string, string>> {
    return this.menuTranslationService.getMenuTranslations(lang, forceReload);
  }

  showSuccess(msgText: string, params: (string | number)[] = []): Promise<void> {
    return this.notificationService.showSuccess(msgText, params);
  }

  showError(msgText: string, params: (string | number)[] = []): Promise<void> {
    return this.notificationService.showError(msgText, params);
  }
}