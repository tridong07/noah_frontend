// Cấu trúc Node trên Tree Menu
export interface TreeNode {
  id: string;
  label: string;
  type: 'CATEGORY' | 'USER' | 'ROLE' | 'WINDOW';
  code?: string;
  icon?: string;
  children?: TreeNode[];
  isExpanded?: boolean;
}

// Quyền hạn của Window
export interface WindowPermissions {
  canView: boolean;      // 瀏覽權限
  canAdd: boolean;       // 新增權限
  canEdit: boolean;      // 修改權限
  canDelete: boolean;    // 刪除權限
  canAudit?: boolean;    // 審核權限
  canPrint?: boolean;    // 列印權限
  isPrivate?: boolean;   // 不公開權限
}

// Chi tiết cấu hình một Window (Form chính)
export interface WindowDetail {
  programCode: string;       // 03.02.03
  programName: string;       // 考勤管理作業
  windowType: string;        // M.Model
  windowCode: string;
  menuOrder: number;
  useRemark: boolean;
  pblFileName?: string;
  excelFolder?: string;
  systemCategory: string;    // Hệ Thống Nhân Sự
  permissions: WindowPermissions;
  // Metadata read-only
  menuId: number;
  parentCode: string;
  programLevel: number;
  updatedBy: string;
  updatedAt: string;
}