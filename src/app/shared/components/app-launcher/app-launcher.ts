import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AppLauncherService } from './app-launcher.service';
import { AppLauncherState, CrmMenuItem } from '../../models/crm-module.model';
import { TranslationService } from '../../../shared/translate/translation.service';

@Component({
  selector: 'app-app-launcher',
  standalone: true,
  imports: [
    CommonModule, 
    TranslatePipe
  ],
  templateUrl: './app-launcher.html',
  styleUrls: ['./app-launcher.css']
})
export class AppLauncherComponent implements OnInit, OnDestroy {
  state$!: Observable<AppLauncherState>;

  // =========================================================================
  // 1. INJECT SERVICES
  // =========================================================================
  public launcherService = inject(AppLauncherService);
  private translationService = inject(TranslationService);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  private langSub!: Subscription;

  // =========================================================================
  // 2. LIFECYCLE HOOKS
  // =========================================================================
  ngOnInit(): void {
    this.state$ = this.launcherService.state$;

    // 🟢 Lắng nghe sự kiện đổi ngôn ngữ Realtime để ép Change Detection re-evaluating Template
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }

  // =========================================================================
  // 3. PUBLIC HELPER METHODS (Đã tinh gọn)
  // =========================================================================

  /**
   * Helper tra cứu dịch tên Phân hệ/Module
   * 👉 Ủy quyền hoàn toàn cho AppLauncherService.getTranslatedName()
   */
  getModuleName(module: CrmMenuItem | null | undefined): string {
    return this.launcherService.getTranslatedName(module);
  }

  /**
   * Lấy mã MENU_NO hiển thị làm Icon / Badge Avatar
   */
  getModuleInitial(module: CrmMenuItem | null | undefined): string {
    if (!module) return 'M';

    // 1. Ưu tiên lấy menuNo trực tiếp
    if (module.menuNo) {
      return String(module.menuNo).trim();
    }

    // 2. Bóc tách ký tự trong ngoặc vuông (VD: 【三】 -> 三 hoặc 【03】 -> 03)
    const name = this.getModuleName(module);
    const matchBracket = name.match(/^[【\[\(\{\s]*([^】\]\)\}\s]+)[】\]\)\}]/);
    if (matchBracket && matchBracket[1]) {
      return matchBracket[1];
    }

    // 3. Fallback chữ cái đầu
    const cleanName = name.replace(/^[【\[\(\{\s\d\.\-\_]+/g, '').trim();
    return cleanName.charAt(0).toUpperCase() || 'M';
  }

  /**
   * Lấy mã hiển thị ưu tiên menuNo, nếu không có sẽ lấy id
   */
  getDisplayMenuCode(app: CrmMenuItem | null | undefined): string {
    if (!app) return '';

    if (app.menuNo !== undefined && app.menuNo !== null && String(app.menuNo).trim() !== '') {
      return String(app.menuNo).trim();
    }

    return app.id ? String(app.id).trim() : '';
  }

  // =========================================================================
  // 4. EVENT HANDLERS
  // =========================================================================
  onSelectModule(moduleId: string): void {
    this.launcherService.selectModule(moduleId);
  }

  onClose(): void {
    this.launcherService.closeLauncher();
  }
}