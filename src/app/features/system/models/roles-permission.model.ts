export interface SystemRoles {
  ROLE_ID : number;
  ROLE_NO : string;
  ROLE_NAME? : string | null;
  ROLE_DESC? : string | null;
  SYS_NO?: string | null;
  UPD_USER_ID?: string | null;
  UPD_USER_NO?: string | null;
  UPD_TIMESTAMP?: string | null;
  FACT_NO? : string | null;
  USER_COUNT?: number;
}

export interface SaveRoleSafePayload {
  roleId : number;
  roleNo : string;
  roleName? : string | null;
  roleDesc? : string | null;
  factNo? : string | null;

  menuId : number;
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
}

export interface SaveRolePayload {
  roleId : number;
  roleNo : string;
  roleName? : string | null;
  roleDesc? : string | null;
  factNo? : string | null;
}