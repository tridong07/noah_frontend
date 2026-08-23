import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SystemRoles } from '../../../../models/roles-permission.model';
import { UserNamePipe } from '../../../../../../shared/pipes/user-name.pipe';
import { SystemUser } from '../../../../models/user-permission.model';

@Component({
  selector: 'app-roles-permission-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserNamePipe],
  templateUrl: './roles-permission-info.html',
  styleUrls: ['./roles-permission-info.css']
})
export class RolesPermissionInfoComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  
  @Input() roleData: SystemRoles | null = null;
  @Input() allUsers: SystemUser[] = [];

  @Output() save = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  infoForm!: FormGroup;
  isEditing = false;
  isNewRole = false;

  ngOnInit(): void {
    this.initForm();
    this.updateFormState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roleData'] && this.infoForm) {
      this.updateFormState();
    }
  }

  private initForm() {
    this.infoForm = this.fb.group({
      roleId: [{ value: '', disabled: true }],
      roleNo: [{ value: '', disabled: true }],
      roleName: [{ value: '', disabled: true }],
      roleDesc: [{ value: '', disabled: true }],
      factNo: [{ value: 'ALL', disabled: true }],
      createdBy: [{ value: '', disabled: true }],
      updatedById: [{ value: '', disabled: true }],
      updatedBy: [{ value: '', disabled: true }],
      updatedAt: [{ value: '', disabled: true }]
    });
  }

  private updateFormState() {
    if (this.roleData) {
      const data = this.roleData as any;

      this.infoForm.patchValue({
        roleId: data.ROLE_ID ?? data.roleId ?? data.id ?? '',
        roleNo: data.ROLE_NO ?? data.roleNo ?? data.code ?? '',
        roleName: data.ROLE_NAME ?? data.roleName ?? data.name ?? '',
        roleDesc: data.ROLE_DESC ?? data.roleDesc ?? data.description ?? '',
        factNo: data.FACT_NO ?? data.factNo ?? data.SYS_NO ?? 'ALL',
        createdBy: data.UPD_USER_NO ?? data.createdBy ?? '',
        updatedById: data.UPD_USER_ID ?? data.updatedById ?? '',
        updatedBy: data.UPD_USER_NO ?? data.updatedBy ?? '',
        updatedAt: data.UPD_TIMESTAMP ? this.formatTimestamp(data.UPD_TIMESTAMP) : (data.updatedAt ?? '')
      });
    } else {
      this.infoForm.reset({ factNo: 'ALL' });
    }
    this.disableForm();
  }

  private enableForm() {
    // 🟢 Sửa lại đúng tên các control theo camelCase giống lúc khởi tạo form
    this.infoForm.get('roleNo')?.enable();
    this.infoForm.get('roleName')?.enable();
    this.infoForm.get('roleDesc')?.enable();
  }

  private disableForm() {
    // 🟢 Sửa lại đúng tên các control theo camelCase
    this.infoForm.get('roleNo')?.disable();
    this.infoForm.get('roleName')?.disable();
    this.infoForm.get('roleDesc')?.disable();
  }

  private formatTimestamp(timestamp: string): string {
    if (!timestamp || timestamp.length !== 14) return timestamp;
    
    const year = parseInt(timestamp.substring(0, 4), 10);
    const month = parseInt(timestamp.substring(4, 6), 10) - 1; // Tháng trong JS tính từ 0 đến 11
    const day = parseInt(timestamp.substring(6, 8), 10);
    const hour = parseInt(timestamp.substring(8, 10), 10);
    const minute = parseInt(timestamp.substring(10, 12), 10);
    const second = parseInt(timestamp.substring(12, 14), 10);
    
    // Tạo đối tượng Date theo giờ địa phương
    const dateObj = new Date(year, month, day, hour, minute, second);
    
    // Kiểm tra nếu date không hợp lệ thì trả về nguyên bản
    if (isNaN(dateObj.getTime())) return timestamp;

    // Sử dụng toLocaleString() để tự động lấy định dạng ngày giờ của hệ điều hành/trình duyệt
    // Bạn có thể để trống hoặc truyền navigator.language để tự động nhận diện ngôn ngữ máy người dùng
    return dateObj.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // Đặt là true nếu muốn hiển thị dạng 12 giờ (AM/PM) theo thói quen của một số quốc gia
    });
  }

  startCreate() {
    this.isEditing = true;
    this.isNewRole = true;
    this.infoForm.reset({ factNo: 'ALL' });
    this.enableForm();
  }

  startEdit() {
    if (!this.roleData) return;
    this.isEditing = true;
    this.isNewRole = false;
    this.enableForm();
  }

  cancelAction() {
    this.isEditing = false;
    this.isNewRole = false;
    this.updateFormState();
  }

  saveChanges() {
    if (this.infoForm.invalid) return;
    const formValues = this.infoForm.getRawValue();
    this.save.emit({ ...formValues, isNew: this.isNewRole });
    this.isEditing = false;
    this.disableForm();
  }

  deleteUser() {
    if (this.roleData) {
      this.delete.emit(this.roleData);
    }
  }
}