export default function ModuleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full bg-white">
      {/* Layout chỉ chứa những thứ dùng chung toàn trang (header, v.v.) */}
      {children}
    </div>
  );
}