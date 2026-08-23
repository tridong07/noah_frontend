/**
 * Interface biểu diễn cấu trúc một Nút (Node) trên Cây Menu
 * Phản ánh chính xác DTO/Entity trả về từ Backend API `getMenuByUserId`
 */
export interface CrmMenuItem {
  id: string;              /** ID duy nhất của Menu (MENU_ID hoặc MENU_NO) */
  menuNo: string;          /** Mã số hiển thị/phân cấp Menu (A.MENU_NO từ DB, VD: "03", "03.01") */
  name: string;            /** Tên hiển thị mặc định của Menu (A.MENU_NAME) */
  upMenuNo: string | null; /** Mã của Menu cấp cha (A.UP_MENU_NO). Nếu là Root Module thì là null */
  level: number;           /** Cấp độ phân cấp dựa theo số dấu chấm trong menuNo (0: Module, 1: Group...) */
  isFolder: boolean;       /** true nếu có chứa menu con | false nếu là trang chức năng */

  // =========================================================================
  // PHÂN QUYỀN USER (B.LMT_*)
  // =========================================================================
  all?: boolean;
  view: boolean;           /** Quyền xem/truy cập (LMT_SEL) */
  add?: boolean;           /** Quyền thêm mới (LMT_INS) */
  edit?: boolean;          /** Quyền chỉnh sửa (LMT_UPD) */
  delete?: boolean;        /** Quyền xóa (LMT_DEL) */
  print?: boolean;         /** Quyền in (LMT_PRN) */
  run?: boolean;           /** Quyền thực thi (LMT_RUN) */
  adm?: boolean;           /** Quyền quản trị (LMT_ADM) */
  reprn?: boolean;         /** Quyền in lại (LMT_REPRN) */
  man?: boolean;           /** Quyền quản lý (LMT_MAN) */

  // =========================================================================
  // PHÂN QUYỀN HỆ THỐNG (A.LMT_*)
  // =========================================================================
  sysHasView?: boolean;
  sysHasAdd?: boolean;
  sysHasEdit?: boolean;
  sysHasDelete?: boolean;
  sysHasPrint?: boolean;
  sysHasRun?: boolean;
  sysHasAdm?: boolean;
  sysHasReprn?: boolean;
  sysHasMan?: boolean;

  // =========================================================================
  // UI & NAVIGATION PROPERTIES
  // =========================================================================
  url?: string;            /** Route path Angular */
  icon?: string;           /** Icon class hoặc image URL */
  sortOrder?: number;      /** Thứ tự hiển thị */
  children: CrmMenuItem[]; /** Danh sách các menu con (đệ quy) */
}

/**
 * Interface bổ trợ biểu diễn Top-Level Module (Level = 0 trong Cây Menu)
 * Dùng riêng cho App Launcher Popover / App Switcher Grid
 */
export interface CrmAppModule {
  id: string;
  no: string;              /** Mapped từ menuNo */
  name: string;
  icon?: string;
  description?: string;
  badgeCount?: number;
  children: CrmMenuItem[]; /** Các menu con thuộc Module này */
}

/**
 * Interface Trạng thái App Launcher State
 */
export interface AppLauncherState {
  menuTree: CrmMenuItem[];   /** Toàn bộ Cây Menu lấy từ API */
  modules: CrmMenuItem[];    /** Danh sách Module cấp cao nhất (Level 0) */
  activeModule: CrmMenuItem | null; /** Module đang chọn */
  isOpen: boolean;           /** Trạng thái Bật/Tắt Popover */
}