import { MenuItem } from '../../features/system/models/user-permission.model';

/**
 * Cấu trúc DỮ LIỆU 1 DÒNG QUYỀN mà Backend thực sự nhận (SaveUserSafeDto / SaveRoleSafeDto).
 * Backend xử lý theo kiểu "1 request = 1 dòng MENU_ID" (MERGE INTO ... theo từng menu),
 * và dùng chuỗi 'Y'/'N' thay vì boolean.
 */
export interface SafePermissionFlagsDto {
  menuId: number;
  lmtSel: 'Y' | 'N';
  lmtIns: 'Y' | 'N';
  lmtUpd: 'Y' | 'N';
  lmtDel: 'Y' | 'N';
  lmtPrn: 'Y' | 'N';
  lmtRun: 'Y' | 'N';
  lmtAdm: 'Y' | 'N';
  lmtReprn: 'Y' | 'N';
  lmtMan: 'Y' | 'N';
}

/**
 * Duyệt đệ quy toàn bộ cây Menu (kể cả node cha lẫn node con) và chuyển từng node
 * sang đúng format mà Backend yêu cầu:
 *  - id (string) -> menuId (number)
 *  - các cờ boolean trên FE (view/add/edit/delete/print/run/adm/reprn/man)
 *    -> các field lmtSel/lmtIns/lmtUpd/lmtDel/lmtPrn/lmtRun/lmtAdm/lmtReprn/lmtMan ('Y'/'N')
 *
 * Bỏ qua node có id không parse được thành số (tránh gửi menuId: NaN lên BE).
 */
export function flattenMenuPermissions(items: MenuItem[] | null | undefined): SafePermissionFlagsDto[] {
  const result: SafePermissionFlagsDto[] = [];

  const walk = (nodes: MenuItem[] | undefined) => {
    nodes?.forEach(node => {
      const menuId = Number(node.id);
      if (!isNaN(menuId)) {
        result.push({
          menuId,
          lmtSel: node.view ? 'Y' : 'N',
          lmtIns: node.add ? 'Y' : 'N',
          lmtUpd: node.edit ? 'Y' : 'N',
          lmtDel: node.delete ? 'Y' : 'N',
          lmtPrn: node.print ? 'Y' : 'N',
          lmtRun: node.run ? 'Y' : 'N',
          lmtAdm: node.adm ? 'Y' : 'N',
          lmtReprn: node.reprn ? 'Y' : 'N',
          lmtMan: node.man ? 'Y' : 'N',
        });
      }
      if (node.children?.length) walk(node.children);
    });
  };

  walk(items || []);
  return result;
}