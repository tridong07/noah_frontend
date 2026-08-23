import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CrmMenuItem, AppLauncherState } from '../../models/crm-module.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppLauncherService {
  private apiUrl = environment.apiUrl;

  private initialState: AppLauncherState = {
    menuTree: [],
    modules: [],
    activeModule: null,
    isOpen: false
  };

  public stateSubject = new BehaviorSubject<AppLauncherState>(this.initialState);
  public state$: Observable<AppLauncherState> = this.stateSubject.asObservable();

  /**
   * 🌟 Trả về trực tiếp danh sách sub-menu của Active Module
   */
  public currentSubMenus$: Observable<CrmMenuItem[]> = this.state$.pipe(
    map(state => {
      if (!state.activeModule) return [];
      return state.activeModule.children || (state.activeModule as any).subMenus || [];
    })
  );

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) {}

  private readonly ACTIVE_MODULE_KEY = 'crm_active_module_id';

  loadMenuByUserId(userId: number): Observable<CrmMenuItem[]> {
    return this.http.get<CrmMenuItem[]>(`${this.apiUrl}/user/menu/${userId}`).pipe(
      tap((menuTree: CrmMenuItem[]) => {
        const rawData = menuTree || [];

        const modules = rawData.filter(m => {
          const isLevelZero = Number(m.level) === 0;
          const hasNoParent = !m.upMenuNo || String(m.upMenuNo).trim() === '';
          return isLevelZero || hasNoParent;
        });

        // 1. Kiểm tra ID module đã lưu trong localStorage
        const savedModuleId = localStorage.getItem(this.ACTIVE_MODULE_KEY);
        let targetActive: CrmMenuItem | null = null;

        if (savedModuleId) {
          targetActive = modules.find(m => 
            String(m.id) === String(savedModuleId) || 
            String(m.menuNo) === String(savedModuleId)
          ) || null;
        }

        // 2. Fallback nếu không tìm thấy module cũ
        if (!targetActive) {
          const currentActive = this.stateSubject.value.activeModule;
          targetActive = currentActive || (modules.length > 0 ? modules[0] : null);
        }

        // 3. Cập nhật lại localStorage
        if (targetActive) {
          localStorage.setItem(this.ACTIVE_MODULE_KEY, String(targetActive.id || targetActive.menuNo));
        }

        this.stateSubject.next({
          ...this.stateSubject.value,
          menuTree: rawData,
          modules: modules,
          activeModule: targetActive
        });
      }),
      catchError((error) => {
        console.error('❌ [AppLauncher] Lỗi khi gọi API Menu:', error);
        return throwError(() => error);
      })
    );
  }

  selectModule(moduleId: string): void {
    const currentState = this.stateSubject.value;
    const targetModule = currentState.modules.find(m => String(m.id) === String(moduleId)) || null;

    if (targetModule) {
      localStorage.setItem(this.ACTIVE_MODULE_KEY, String(targetModule.id || targetModule.menuNo));
      this.stateSubject.next({
        ...currentState,
        activeModule: targetModule,
        isOpen: false
      });
    }
  }

  /**
   * 🌐 Helper dịch tên Menu tập trung (PUBLIC để Header, Sidebar, Launcher xài chung)
   */
  public getTranslatedName(item: CrmMenuItem | null | undefined): string {
    if (!item) return '';

    const rawId = item.id ? String(item.id).trim() : '';
    const rawNo = item.menuNo ? String(item.menuNo).trim() : '';

    const cleanId = rawId.replace(/[\.\-\_]/g, '');
    const numericId = String(parseInt(cleanId, 10) || '');

    const cleanNo = rawNo.replace(/[\.\-\_]/g, '');
    const numericNo = String(parseInt(cleanNo, 10) || '');

    // Chiến lược tra cứu bao phủ mọi kiểu Key
    const keysToTry = [
      `MENU.${rawId}`,
      `MENU.${cleanId}`,
      `MENU.${numericId}`,
      `MENU.${rawNo}`,
      `MENU.${cleanNo}`,
      `MENU.${numericNo}`,
      rawId,
      cleanId,
      numericId,
      rawNo,
      cleanNo,
      numericNo
    ].filter(k => !!k);

    // 1. Dịch theo danh sách Keys
    for (const key of keysToTry) {
      const translated = this.translate.instant(key);
      if (translated && translated !== key) {
        return translated;
      }
    }

    // 2. Dịch trực tiếp theo Tên gốc nếu Tên gốc là 1 Key
    if (item.name) {
      const translatedByName = this.translate.instant(item.name);
      if (translatedByName && translatedByName !== item.name) {
        return translatedByName;
      }

      // 3. Lọc ngoặc vuông 【三】
      const cleanName = item.name.replace(/^[【\[\(\{\s]*[^】\]\)\}\s]+[】\]\)\}]\s*/, '').trim();
      if (cleanName && cleanName !== item.name) {
        const translatedClean = this.translate.instant(cleanName);
        if (translatedClean && translatedClean !== cleanName) {
          return translatedClean;
        }
        return cleanName;
      }
    }

    return item.name || '';
  }

  /**
   * 🔍 Hàm lọc danh sách Modules
   */
  getFilteredModules(modules: CrmMenuItem[] | undefined | null, searchTerm: string): CrmMenuItem[] {
    if (!modules || !Array.isArray(modules)) return [];
    if (!searchTerm || !searchTerm.trim()) return modules;

    const term = searchTerm.toLowerCase().trim();
    return modules.filter(m => {
      const translatedName = this.getTranslatedName(m).toLowerCase();
      const rawName = (m.name || '').toLowerCase();
      const id = String(m.id || '').toLowerCase();
      const menuNo = String(m.menuNo || '').toLowerCase();

      return translatedName.includes(term) || 
             rawName.includes(term) || 
             id.includes(term) || 
             menuNo.includes(term);
    });
  }

  /**
   * 🧮 Đếm tổng số lượng menu đệ quy
   */
  countTotalNodes(items: CrmMenuItem[] | undefined | null): number {
    if (!items || !Array.isArray(items)) return 0;
    let total = 0;
    for (const item of items) {
      total += 1;
      const children = item.children || (item as any).subMenus;
      if (children && children.length > 0) {
        total += this.countTotalNodes(children);
      }
    }
    return total;
  }

  /**
   * 🔍 LỌC CÂY MENU ĐỆ QUY (Sâu vô tận)
   */
  getFilteredSubMenus(subMenus: CrmMenuItem[] | undefined | null, searchTerm: string): CrmMenuItem[] {
    if (!subMenus || !Array.isArray(subMenus)) return [];
    if (!searchTerm || !searchTerm.trim()) return subMenus;

    const term = searchTerm.toLowerCase().trim();

    const filterTree = (items: CrmMenuItem[]): CrmMenuItem[] => {
      const result: CrmMenuItem[] = [];

      for (const item of items) {
        const translatedName = this.getTranslatedName(item).toLowerCase();
        const rawName = (item?.name || '').toString().toLowerCase();
        const idMatch = (item?.id || '').toString().toLowerCase();
        const menuNoMatch = (item?.menuNo || '').toString().toLowerCase();

        const matchesSelf = translatedName.includes(term) || 
                            rawName.includes(term) || 
                            idMatch.includes(term) || 
                            menuNoMatch.includes(term);

        const childList = item.children || (item as any).subMenus || [];
        const matchingChildren = childList.length > 0 ? filterTree(childList) : [];

        if (matchesSelf || matchingChildren.length > 0) {
          result.push({
            ...item,
            children: matchingChildren.length > 0 ? matchingChildren : (matchesSelf ? childList : []),
            subMenus: matchingChildren.length > 0 ? matchingChildren : (matchesSelf ? childList : [])
          } as CrmMenuItem);
        }
      }

      return result;
    };

    return filterTree(subMenus);
  }

  openLauncher(): void {
    this.stateSubject.next({ ...this.stateSubject.value, isOpen: true });
  }

  toggleLauncher(): void {
    this.stateSubject.next({ ...this.stateSubject.value, isOpen: !this.stateSubject.value.isOpen });
  }

  closeLauncher(): void {
    this.stateSubject.next({ ...this.stateSubject.value, isOpen: false });
  }
}