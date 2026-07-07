export const TreeItem = ({ label, children, icon }: any) => (
  <div className="ml-4">
    <div className="flex items-center gap-2 py-1 cursor-pointer hover:bg-sap-blue/10">
      <span>{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </div>
    {children && <div className="ml-2">{children}</div>}
  </div>
);