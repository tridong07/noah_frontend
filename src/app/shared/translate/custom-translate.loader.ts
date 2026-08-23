import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export class CustomTranslateHttpLoader implements TranslateLoader {
  // Đường dẫn gọi API lấy bản dịch giao diện
  private apiUrl = `${environment.apiUrl}/translations`;

  constructor(private http: HttpClient) {}

  /**
   * Tải danh sách bản dịch (Key-Value) theo ngôn ngữ (VN, EN, CHT, CHS...)
   */
  getTranslation(lang: string): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(`${this.apiUrl}?lang=${lang}`).pipe(
      catchError((error) => {
        console.error(`[i18n Loader] Lỗi tải từ điển ngôn ngữ '${lang}':`, error);
        return of({}); // Trả về object rỗng nếu có lỗi để ứng dụng không bị crashing
      })
    );
  }
}