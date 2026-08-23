import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuTranslationService {
  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  /** Cache từ điển theo ngôn ngữ trong bộ nhớ tạm (In-Memory) */
  private menuDictCache = new Map<string, Record<string, string>>();

  /**
   * Gọi API lấy từ điển dịch Menu hệ thống theo mã ngôn ngữ 
   * Có hỗ trợ Cache tạm thời trong bộ nhớ RAM
   */
  getMenuTranslations(lang: string, forceReload = false): Observable<Record<string, string>> {
    // 🟢 1. Nếu đã có trong Cache và không yêu cầu load lại -> Dùng cache ngay lập tức
    if (!forceReload && this.menuDictCache.has(lang)) {
      const cachedDict = this.menuDictCache.get(lang)!;
      this.applyTranslations(lang, cachedDict);
      return of(cachedDict);
    }

    // 🟢 2. Nếu chưa có -> Gọi API lấy dữ liệu mới
    const url = `${environment.apiUrl}/translations/menu-translations?lang=${lang}`;

    return this.http.get<Record<string, string>>(url).pipe(
      tap((menuDict) => {
        if (menuDict && Object.keys(menuDict).length > 0) {
          // Lưu vào bộ nhớ Ram Cache
          this.menuDictCache.set(lang, menuDict);
          
          // Nạp vào NgxTranslate
          this.applyTranslations(lang, menuDict);

          //console.log(`✅ [MenuTranslationService] Đã merge ${Object.keys(menuDict).length} keys cho [${lang}]`);
        }
      }),
      catchError((err) => {
        console.error(`[MenuTranslation] Lỗi tải từ điển Menu cho ngôn ngữ ${lang}:`, err);
        return of({});
      })
    );
  }

  /**
   * Nạp dictionary vào ngx-translate
   */
  private applyTranslations(lang: string, menuDict: Record<string, string>): void {
    // Nạp phẳng (ví dụ: key '701')
    this.translate.setTranslation(lang, menuDict, true);
    // Nạp bọc dưới prefix 'MENU' (ví dụ: key 'MENU.701')
    this.translate.setTranslation(lang, { MENU: menuDict }, true);
  }

  /**
   * Xóa Cache khi User Logout hoặc khi Admin cập nhật menu
   */
  clearCache(): void {
    this.menuDictCache.clear();
  }
}