'use client';
import { SystemSettingsSidebar } from '@/features/system-settings/components/UserPermissionForm';
import { useState } from 'react';

export default function SystemSettingsPage() {
  const [activeItem, setActiveItem] = useState('users');

  return (
    <div className="flex h-full">
      <SystemSettingsSidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      
      <main className="flex-1 p-8 overflow-y-auto bg-[var(--color-background)]">
        {activeItem === 'users' && <UserManagementForm />}
        {activeItem === 'roles' && <RoleManagementForm />}
        {activeItem === 'windows' && <WindowManagementForm />}
      </main>
    </div>
  );
}