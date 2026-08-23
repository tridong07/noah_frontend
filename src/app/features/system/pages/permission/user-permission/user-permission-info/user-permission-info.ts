import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { SystemUser } from '../../../../models/user-permission.model';
import { UserNamePipe } from '../../../../../../shared/pipes/user-name.pipe';

@Component({
  selector: 'app-user-permission-info',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    UserNamePipe
  ],
  templateUrl: './user-permission-info.html'
})
export class UserPermissionInfoComponent {
  @Input() selectedUser: any;
  @Input() isNewUser: boolean = false;
  @Input() isEditing: boolean = false;
  @Input() avatarBaseUrl: string = '';
  @Input() allUsers: SystemUser[] = [];

  @Output() startCreate = new EventEmitter<void>();
  @Output() startEdit = new EventEmitter<void>();
  @Output() cancelAction = new EventEmitter<void>();
  @Output() saveUserChanges = new EventEmitter<void>();
  @Output() avatarSelected = new EventEmitter<any>();

  @Output() deleteUser = new EventEmitter<void>();

  onFileSelected(event: any): void {
    this.avatarSelected.emit(event);
  }

  onStartCreate(): void {
    this.startCreate.emit();
  }

  onStartEdit(): void {
    this.startEdit.emit();
  }

  onCancel(): void {
    this.cancelAction.emit();
  }

  onSave(): void {
    this.saveUserChanges.emit();
  }

  onDel() {
    // 🟢 Sửa lại dùng đúng biến selectedUser và sự kiện deleteUser đã khai báo
    this.deleteUser.emit(this.selectedUser);
  }
}