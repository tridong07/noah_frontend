'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { UserTreeSkeleton } from './UserTreeSkeleton';

export default function UserTree({ 
  onSelect, 
  selectedId, 
  win_no 
}: { 
  onSelect: (id: number) => void, 
  selectedId: number | null,
  win_no: string 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['users', win_no],
    queryFn: () => userService.getAll(),
  });

  if (isLoading) return <UserTreeSkeleton />;

  const filteredUsers = users?.filter((user: any) => 
    user.USER_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.USER_NO.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full p-2 space-y-2 bg-background">
      <input
        type="text"
        placeholder="Tìm kiếm nhân viên..."
        // Sử dụng các biến từ globals: input-bg, border-subtle
        className="w-full px-3 py-2 text-sm border border-border-subtle rounded-md bg-input-bg focus:outline-none focus:ring-1 focus:ring-sap-blue"
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="flex-1 overflow-y-auto">
        {filteredUsers?.map((user: any) => (
          <button
            key={user.USER_ID}
            onClick={() => onSelect(user.USER_ID)}
            // Đồng bộ màu chọn (sap-blue) và màu hover (sap-blue/10)
            className={`w-full flex items-center px-3 py-2 text-sm text-left rounded-md transition-all border-b border-border-subtle ${
              selectedId === user.USER_ID 
                ? 'bg-sap-blue text-white' 
                : 'hover:bg-sap-blue/10 text-foreground'
            }`}
          >
            <div className="flex flex-col truncate">
              <span className="font-medium truncate">{user.USER_NAME}</span>
              <span className={`text-[10px] ${
                selectedId === user.USER_ID ? 'text-blue-100' : 'text-gray-400'
              }`}>
                {user.USER_NO}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}