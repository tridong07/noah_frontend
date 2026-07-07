import { Skeleton } from '@/components/ui/Skeleton';

export function UserTreeSkeleton() {
  return (
    <div className="flex flex-col p-2 space-y-2">
      <Skeleton className="h-9 w-full" /> {/* Ô tìm kiếm */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center px-3 py-2 border-b">
          <div className="space-y-1 w-full">
            <Skeleton className="h-4 w-3/4" /> {/* Dòng tên */}
            <Skeleton className="h-3 w-1/4" /> {/* Dòng mã nhân viên */}
          </div>
        </div>
      ))}
    </div>
  );
}