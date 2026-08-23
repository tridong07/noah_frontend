import { Injectable, inject } from '@angular/core';
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { bufferTime, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface MissingKeyItem {
  properties: string;
  defaultText: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomMissingTranslationHandler implements MissingTranslationHandler {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Set lưu danh sách các key đã gửi để không bị lặp lại
  private registeredKeys = new Set<string>();

  // RxJS Subject dùng để gom các key thiếu trước khi gửi API
  private missingKey$ = new Subject<MissingKeyItem>();

  constructor() {
    // Gom các key kích hoạt trong vòng 300ms thành 1 mảng duy nhất để bắn 1 API request
    this.missingKey$.pipe(
      bufferTime(300),
      filter(items => items.length > 0)
    ).subscribe(items => {
      this.sendAutoRegisterRequest(items);
    });
  }

  handle(params: MissingTranslationHandlerParams) {
    const key = params.key;

    // Ép kiểu để lấy defaultText từ HTML (nếu có)
    const interpolateParams = params.interpolateParams as Record<string, any> | undefined;
    const defaultText = interpolateParams?.['default'] || key;

    // Nếu key chưa từng đăng ký trong phiên làm việc này
    if (!this.registeredKeys.has(key)) {
      this.registeredKeys.add(key);
      // Đưa vào queue gom nhóm
      this.missingKey$.next({
        properties: key,
        defaultText: defaultText
      });
    }

    // Trả về Default Text hiển thị lên UI ngay lập tức
    return defaultText;
  }

  /**
   * Tự động xác định pageCode từ URL hiện tại
   * Ví dụ: /login -> LOGIN_PAGE | /app/hr/employee -> EMPLOYEE_PAGE
   */
  private getPageCode(): string {
    const url = this.router.url.split('?')[0]; // Bỏ query params nếu có
    const segments = url.split('/').filter(Boolean);

    if (segments.length === 0 || url.includes('login')) {
      return 'LOGIN_PAGE';
    }

    // Lấy segment cuối cùng và chuyển thành dạng PAGE_CODE (vd: 'employee-list' -> 'EMPLOYEE_LIST_PAGE')
    const lastSegment = segments[segments.length - 1];
    return `${lastSegment.replace(/-/g, '_').toUpperCase()}_PAGE`;
  }

  /**
   * Gửi Request Payload đúng chuẩn Backend
   */
  private sendAutoRegisterRequest(missingKeys: MissingKeyItem[]) {
    const payload = {
      pageCode: this.getPageCode(),
      missingKeys: missingKeys
    };
    //console.log('[i18n Auto-Register Request Payload]:', JSON.stringify(payload, null, 2));
    this.http.post(`${environment.apiUrl}/translations/auto-register`, payload)
      .subscribe({
        error: (err) => console.warn('[i18n Auto-Register] Lỗi khi đăng ký key mới:', err)
      });
  }
}