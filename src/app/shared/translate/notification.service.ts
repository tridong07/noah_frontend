import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

export interface TranslateMsgRequest {
  msgText: string;
  toLang?: string;
  params?: (string | number)[];
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/translations/msgbox`;

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) {}

  private getCurrentLang(): string {
    const lang = typeof this.translate.currentLang === 'function' 
      ? (this.translate.currentLang as Function)() 
      : this.translate.currentLang;
      
    return lang || 'VN';
  }

  private async getTranslatedMessage(
    msgText: string,
    toLang: string,
    params: (string | number)[]
  ): Promise<string> {
    // 1. Nếu không có msgText, trả về rỗng ngay lập tức
    if (!msgText) return '';

    try {
      // 2. Payload chuẩn khớp 100% với TranslateMsgDto bên Backend
      const payload = {
        msgText,
        toLang: toLang || 'VN',
        params: params || []
      };

      // 3. Gọi API POST
      const res = await firstValueFrom(
        this.http.post<{ message?: string; data?: string; translatedText?: string }>(
          this.apiUrl, 
          payload
        )
      );

      // 4. Ưu tiên lấy chuỗi dịch từ Backend, nếu Backend trả về chuỗi rỗng/undefined -> Fallback interpolate tại Client
      const backendMessage = res?.message || res?.data || res?.translatedText;
      
      if (backendMessage) {
        return backendMessage;
      }

      return this.clientInterpolate(msgText, params);
    } catch (error) {
      console.error('❌ [MsgBox] Lỗi dịch thông báo:', error);
      // 5. Fallback an toàn tuyệt đối khi mất mạng hoặc Backend lỗi 500
      return this.clientInterpolate(msgText, params);
    }
  }

  private clientInterpolate(text: string, params: (string | number)[]): string {
    let result = text;
    params.forEach((param, index) => {
      result = result.replace(new RegExp(`\\{${index}\\}`, 'g'), String(param));
    });
    return result;
  }

  // =========================================================================
  // HIỂN THỊ THÔNG BÁO VỚI SWEETALERT2
  // =========================================================================

  /**
   * Hiển thị Toast THÀNH CÔNG tự động ẩn ở góc trên bên phải
   */
  async showSuccess(msgText: string, params: (string | number)[] = []): Promise<void> {
    const currentLang = this.getCurrentLang();
    
    const translated = await this.getTranslatedMessage(msgText, currentLang, params);
    const displayMessage = translated || msgText || 'Thao tác thành công!';

    Swal.fire({
      icon: 'success',
      title: displayMessage,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'swal2-toast-custom',
        title: 'swal2-toast-title-custom'
      }
      // 🟢 Đã xóa background & color hardcode
    });
  }
  /**
   * Hiển thị Popup THÔNG BÁO LỖI dạng Modal
   */
  async showError(msgText: string, params: (string | number)[] = []): Promise<void> {
    const currentLang = this.getCurrentLang();
    const translated = await this.getTranslatedMessage(msgText, currentLang, params);
    const displayMessage = translated || msgText || 'Có lỗi xảy ra, vui lòng thử lại!';

    // 🟢 Lấy giá trị dịch từ i18n
    let confirmText = this.translate.instant('COMMON.BTN_OK');
    
    // 🟢 NẾU CHƯA DỊCH ĐƯỢC (vẫn bị dính key 'COMMON.BTN_OK') -> Ép về chữ 'Đóng' / 'Đồng ý'
    if (!confirmText || confirmText === 'COMMON.BTN_OK') {
      confirmText = 'Đóng';
    }

    Swal.fire({
      icon: 'error',
      title: displayMessage,
      confirmButtonText: confirmText,
      buttonsStyling: false,
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title',
        confirmButton: 'modern-swal-btn modern-swal-btn-danger',
        icon: 'modern-swal-icon'
      }
    });
  }

  /**
   * Popup HỎI XÁC NHẬN (Confirm Dialog) - Dành cho xóa/đăng xuất/đổi mật khẩu
   */
  async showConfirm(msgText: string, params: (string | number)[] = []): Promise<boolean> {
    const currentLang = this.getCurrentLang();
    const message = await this.getTranslatedMessage(msgText, currentLang, params);
    
    const result = await Swal.fire({
      icon: 'question',
      title: message,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('COMMON.BTN_CONFIRM') || 'Xác nhận',
      cancelButtonText: this.translate.instant('COMMON.BTN_CANCEL') || 'Hủy',
      buttonsStyling: false, // 🟢 Bắt buộc để dùng class custom
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title',
        confirmButton: 'modern-swal-btn modern-swal-btn-primary',
        cancelButton: 'modern-swal-btn modern-swal-btn-secondary',
        actions: 'modern-swal-actions'
      }
    });

    return result.isConfirmed;
  }
}