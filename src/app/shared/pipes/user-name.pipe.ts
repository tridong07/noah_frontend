import { Pipe, PipeTransform } from '@angular/core';
import { SystemUser } from '../../features/system/models/user-permission.model';

@Pipe({
  name: 'userName',
  standalone: true
})
export class UserNamePipe implements PipeTransform {
  transform(value: number | string | null | undefined, allUsers: SystemUser[]): string {
    // Nếu không có giá trị đầu vào hoặc danh sách user trống thì trả về gạch ngang
    if (value === null || value === undefined || value === '' || !allUsers || !allUsers.length) {
      return '-';
    }

    // 🟢 Dò tìm dựa trên cả USER_ID (số/chuỗi số) hoặc USER_NO (chuỗi mã)
    const foundUser = allUsers.find(u => {
      const matchById = u.USER_ID !== undefined && Number(u.USER_ID) === Number(value);
      const matchByNo = u.USER_NO && String(u.USER_NO).trim().toLowerCase() === String(value).trim().toLowerCase();
      
      return matchById || matchByNo;
    });

    // Nếu tìm thấy, trả về định dạng "Mã - Tên"
    if (foundUser) {
      const userNo = foundUser.USER_NO || '';
      const userName = foundUser.USER_NAME || '';
      
      if (userNo && userName) {
        return `${userNo} - ${userName}`;
      }
      return userNo || userName;
    }

    // Nếu không tìm thấy trong mảng cache, hiển thị tạm chính giá trị truyền vào
    return String(value);
  }
}