'use client';
import { useState } from 'react';
import UserTree from '@/features/system-settings/components/UserTree';
import UserFormContainer from '@/features/system-settings/components/UserFormContainer';

// Với Next.js 15+, params thường là Promise
export default function ModulePage({ params }: { params: { win_no: string } }) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // Trích xuất win_no từ params
  const win_no = params.win_no;

  return (
    <div className="flex h-screen gap-4 p-4">
      {/* Master: Tree */}
      <div className="w-1/3 border-r pr-4">
        <UserTree 
          onSelect={(id) => setSelectedUserId(id)} 
          selectedId={selectedUserId}
          win_no={win_no} // Truyền win_no vào đây
        />
      </div>

      {/* Detail: Form */}
      <div className="w-2/3 bg-white p-4 rounded shadow-sm border">
        {selectedUserId ? (
          <UserFormContainer userId={selectedUserId} />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            Vui lòng chọn một người dùng từ danh sách
          </div>
        )}
      </div>
    </div>
  );
}