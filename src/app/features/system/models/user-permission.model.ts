// ==========================================
// 1. SYSTEM USER MODEL (GET /api/v1/user)
// ==========================================
export interface SystemUser {
  USER_ID: number;
  USER_NO: string;
  USER_NAME: string;
  USER_PWD?: string;
  USER_EMAIL: string | null;
  FACT_NO: string | null;
  FACT_ID?: number | null;
  DEPT_ID?: number | null;
  TEAM_ID?: number | null;
  IP_ADDRESS?: string | null;
  SEX?: string | null;
  UI_LANG_NO?: string | null;
  TAG_LANG_NO1?: string | null;
  TAG_LANG_NO2?: string | null;
  PWD_START_DATE?: string | null;
  PWD_STOP_DATE?: string | null;
  ADMIN_MK: 'Y' | 'N';
  UPD_USER_ID?: number;
  UPD_USER_NO?: string;
  UPD_TIMESTAMP?: string;
  PWD_CHANGE_DATE?: string;
  LOGIN_DATE?: string;
  LOGIN_ERR_TIMES?: number | null;
  TEL1?: string | null;
  TEL2?: string | null;
  DEPT_NO?: string | null;
  STOP_NOTE?: string | null;
  USE_STATUS?: string | null;
  MAC_MK?: string | null;
  MAC_ADDRESS?: string | null;
  RESET_OTP?: string | null;
  RESET_EXPIRE?: string | null;
  USER_AVATAR_URL: string | null;
}

// ==========================================
// 2. USER ROLE MODEL (GET /api/v1/user/roles/{userId})
// ==========================================
export interface UserRole {
  ROLE_ID: number;
  ROLE_NAME: string;
  ROLE_DESC: string | null;
  USER_COUNT: number;
  IS_ASSIGNED: 1 | 0; // 1: Đã gán, 0: Chưa gán
}

// ==========================================
// 3. MENU / SAFE PERMISSION MODEL (GET /api/v1/user/safe/{userId})
// ==========================================
export interface MenuItem {
  id: string;
  menuNo: string;
  name: string;
  upMenuNo: string;
  level: number;
  isFolder: boolean;
  
  url?: string | null;
  icon?: string | null;

  // Trạng thái bật/tắt quyền của User
  all: boolean;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  print: boolean;
  run: boolean;
  adm: boolean;
  reprn: boolean;
  man: boolean;
  expanded?: boolean;
  
  // Cờ hệ thống xác định chức năng có tồn tại hay không (Enable/Disable Checkbox)
  sysHasView: boolean;
  sysHasAdd: boolean;
  sysHasEdit: boolean;
  sysHasDelete: boolean;
  sysHasPrint: boolean;
  sysHasRun: boolean;
  sysHasAdm: boolean;
  sysHasReprn: boolean;
  sysHasMan: boolean;

  // Cây menu con
  children: MenuItem[];
}
export interface insertUpdateUserDto {
  userId?: number;
  userNo: string;
  userName: string;
  userPwd: string;
  factNo?: string;
  userEmail: string;
  userTel?: string;
  userSex?: string;
  adminMk?: string;
  userStatus?: string;
  deptId?: number;
}

// ==========================================
// 4. REQUEST PAYLOAD MODELS (POST API)
// ==========================================
export interface SaveUserRolePayload {
  userId: number;
  roleIds: number[];
}

export interface SaveUserSafePayload {
  userId: number;
  permissions: MenuItem[];
}

