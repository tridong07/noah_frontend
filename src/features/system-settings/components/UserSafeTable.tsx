'use client';
import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';

interface UserSafeTableProps {
  userId: number;
  initialSafe?: any[]; 
}

interface PermissionNode {
  id: string;        
  name: string;      
  level: number;     
  isFolder: boolean; 
  all: boolean;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  print: boolean;
  run: boolean;
  adm: boolean;
  reprn: boolean;
  man: boolean;
  
  // 🌟 Thêm các thuộc tính kiểm tra cấu hình gốc từ Backend
  sysHasView: boolean;
  sysHasAdd: boolean;
  sysHasEdit: boolean;
  sysHasDelete: boolean;
  sysHasPrint: boolean;
  sysHasRun: boolean;
  sysHasAdm: boolean;
  sysHasReprn: boolean;
  sysHasMan: boolean;

  children: PermissionNode[]; 
}

export default function UserSafeTable({ userId, initialSafe }: UserSafeTableProps) {
  const [filterType, setFilterType] = useState<'all' | 'selected' | 'unselected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [treeData, setTreeData] = useState<PermissionNode[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (initialSafe && Array.isArray(initialSafe)) {
      setTreeData(initialSafe);
    }
  }, [initialSafe]);

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCollapseAll = (collapse: boolean) => {
    if (collapse) {
      const allFolderIds = new Set<string>();
      const collectFolderIds = (nodes: PermissionNode[]) => {
        nodes.forEach(node => {
          if (node.isFolder) {
            allFolderIds.add(node.id);
            if (node.children) collectFolderIds(node.children);
          }
        });
      };
      collectFolderIds(treeData);
      setCollapsedIds(allFolderIds);
    } else {
      setCollapsedIds(new Set());
    }
  };

  const updateNodeInTree = (nodes: PermissionNode[], id: string, field: string): PermissionNode[] => {
    return nodes.map((node) => {
      if (node.id === id) {
        const updatedNode = { ...node, [field]: !node[field as keyof PermissionNode] };
        
        // Khi tích chọn ALL -> Chỉ tự động gán những quyền mà Hệ thống màn hình đó thực sự cho phép
        if (field === 'all') {
          const val = updatedNode.all;
          if (updatedNode.sysHasView) updatedNode.view = val;
          if (updatedNode.sysHasAdd) updatedNode.add = val;
          if (updatedNode.sysHasEdit) updatedNode.edit = val;
          if (updatedNode.sysHasDelete) updatedNode.delete = val;
          if (updatedNode.sysHasAdm) updatedNode.adm = val;
          if (updatedNode.sysHasPrint) updatedNode.print = val;
          if (updatedNode.sysHasRun) updatedNode.run = val;
          if (updatedNode.sysHasReprn) updatedNode.reprn = val;
          if (updatedNode.sysHasMan) updatedNode.man = val;
        } else if (!updatedNode[field as keyof PermissionNode]) {
          updatedNode.all = false;
        }
        return updatedNode;
      }
      if (node.children && node.children.length > 0) {
        return { ...node, children: updateNodeInTree(node.children, id, field) };
      }
      return node;
    });
  };

  const handleCheckboxChange = (id: string, field: string) => {
    setTreeData((prev) => updateNodeInTree(prev, id, field));
  };

  const filterTree = (nodes: PermissionNode[]): PermissionNode[] => {
    return nodes
      .map((node) => {
        const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) || node.id.includes(searchQuery);
        const hasRights = node.view || node.add || node.edit || node.delete || node.print;
        let matchesFilter = true;
        if (filterType === 'selected') matchesFilter = hasRights;
        if (filterType === 'unselected') matchesFilter = !hasRights;

        const filteredChildren = node.children ? filterTree(node.children) : [];

        if ((matchesSearch && matchesFilter) || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter((node): node is PermissionNode => node !== null);
  };

  // 📊 MODERN DESIGN RENDER TABLE ROWS WITH CONDITIONAL CHECKBOXES
  const renderTreeRows = (nodes: PermissionNode[], isParentCollapsed = false): React.ReactNode[] => {
    return nodes.reduce<React.ReactNode[]>((acc, node) => {
      if (isParentCollapsed) return acc;

      const isCurrentCollapsed = collapsedIds.has(node.id);
      const indentPadding = node.level * 24 + 12; 

      acc.push(
        <tr 
          key={node.id} 
          className={`group border-b border-white/[0.04] transition-all duration-150 relative ${
            node.isFolder 
              ? 'bg-white/[0.01] hover:bg-white/[0.04] font-medium text-foreground/90' 
              : 'hover:bg-sap-blue/[0.04] text-foreground/75'
          }`}
        >
          {/* Cột Tên đối tượng chức năng với đường dẫn hướng */}
          <td className="py-3 pr-4 truncate relative" style={{ paddingLeft: `${indentPadding}px` }}>
            {node.level > 0 && (
              <div 
                className="absolute top-0 bottom-0 border-l-2 border-white/10 group-hover:border-sap-blue/40 transition-colors duration-150"
                style={{ left: `${(node.level - 1) * 24 + 20}px` }}
              />
            )}

            <div className="flex items-center gap-3 relative z-10">
              {node.isFolder ? (
                <button
                  type="button"
                  onClick={() => toggleCollapse(node.id)}
                  className="w-5 h-5 flex items-center justify-center rounded-md bg-white/5 border border-white/10 text-[9px] text-foreground/60 hover:text-sap-blue hover:border-sap-blue/50 transition-all active:scale-95"
                >
                  {isCurrentCollapsed ? '▶' : '▼'}
                </button>
              ) : (
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground/30 group-hover:bg-sap-blue/60 transition-colors" />
                </div>
              )}
              
              <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-foreground/40 group-hover:text-foreground/70 transition-colors">
                {node.id}
              </span>

              <span className={`truncate select-none ${node.isFolder ? 'text-foreground/90' : 'text-foreground/80 group-hover:text-sap-blue transition-colors'}`}>
                {node.name}
              </span>
            </div>
          </td>

          {/* CỘT CHECKBOX ALL: Chỉ hiện ở node chức năng, hoặc tùy theo nghiệp vụ của bạn */}
          <td className="py-3 px-2 text-center w-20">
            {!node.isFolder && (
              <div className="inline-flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={node.all} 
                  onChange={() => handleCheckboxChange(node.id, 'all')}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-sap-blue accent-sap-blue cursor-pointer transition-all hover:scale-105" 
                />
              </div>
            )}
          </td>

          {/* 🌟 ĐIỀU KIỆN ẨN/HIỆN CHECKBOX THEO HỆ THỐNG GỐC CỦA MÀN HÌNH */}
          {[
            { key: 'view', allowed: node.sysHasView || node.isFolder },
            { key: 'add', allowed: node.sysHasAdd && !node.isFolder },
            { key: 'edit', allowed: node.sysHasEdit && !node.isFolder },
            { key: 'delete', allowed: node.sysHasDelete && !node.isFolder },
            { key: 'adm', allowed: node.sysHasAdm && !node.isFolder },
            { key: 'print', allowed: node.sysHasPrint && !node.isFolder },
            { key: 'run', allowed: node.sysHasRun && !node.isFolder },
            { key: 'reprint', allowed: node.sysHasReprn && !node.isFolder },
            { key: 'man', allowed: node.sysHasMan && !node.isFolder }
          ].map((col, idx) => (
            <td key={idx} className="py-3 px-2 text-center w-20">
              {col.allowed ? (
                <div className="inline-flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={node[col.key as keyof PermissionNode] as boolean} 
                    onChange={() => handleCheckboxChange(node.id, col.key)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-sap-blue accent-sap-blue cursor-pointer transition-all hover:scale-105" 
                  />
                </div>
              ) : (
                // Nếu hệ thống không cho phép gán quyền này -> Hiển thị dấu gạch tối giản tinh tế
                <span className="text-white/10 text-xs">-</span>
              )}
            </td>
          ))}
        </tr>
      );

      if (node.children && node.children.length > 0) {
        acc.push(...renderTreeRows(node.children, isParentCollapsed || isCurrentCollapsed));
      }

      return acc;
    }, []);
  };

  const flattenTreeData = (nodes: PermissionNode[]): any[] => {
    return nodes.reduce<any[]>((acc, node) => {
      acc.push({
        MENU_NO: node.id,
        AUTH_ALL: node.all ? 'Y' : 'N',
        AUTH_VIEW: node.view ? 'Y' : 'N',
        AUTH_ADD: node.add ? 'Y' : 'N',
        AUTH_EDIT: node.edit ? 'Y' : 'N',
        AUTH_DEL: node.delete ? 'Y' : 'N',
        AUTH_ADM: node.adm ? 'Y' : 'N',
        AUTH_PRN: node.print ? 'Y' : 'N',
        AUTH_RUN: node.run ? 'Y' : 'N',
        AUTH_REPRN: node.reprn ? 'Y' : 'N',
        AUTH_MAN: node.man ? 'Y' : 'N',
      });
      if (node.children && node.children.length > 0) {
        acc.push(...flattenTreeData(node.children));
      }
      return acc;
    }, []);
  };

  const handleSavePermissions = async () => {
    if (!userId) return alert("Không tìm thấy ID người dùng!");
    try {
      setIsSubmitting(true);
      const rights = flattenTreeData(treeData);
      await userService.saveSafe({ userId, rights });
      alert("Thiết lập và lưu quyền hạn chi tiết thành công!");
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi trong quá trình lưu quyền hạn.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const processedData = filterTree(treeData);

  return (
    <div className="space-y-4 p-2 min-h-[450px]">
      {/* CONTROL BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl backdrop-blur-md">
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 gap-1">
          {(['all', 'selected', 'unselected'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterType === type 
                  ? 'bg-sap-blue text-white shadow-md shadow-sap-blue/20' 
                  : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
              }`}
            >
              {type === 'all' ? 'Tất cả' : type === 'selected' ? 'Đã cấp quyền' : 'Chưa cấp quyền'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => handleCollapseAll(false)} className="px-3 py-1.5 text-xs font-medium border border-white/10 hover:border-sap-blue/50 text-foreground/70 hover:text-sap-blue rounded-lg bg-white/5 transition-all active:scale-95">
            ↔️ Mở rộng tất cả
          </button>
          <button type="button" onClick={() => handleCollapseAll(true)} className="px-3 py-1.5 text-xs font-medium border border-white/10 hover:border-white/20 text-foreground/70 hover:text-foreground/90 rounded-lg bg-white/5 transition-all active:scale-95">
            🔀 Thu nhỏ tất cả
          </button>
        </div>

        <div className="relative w-72">
          <input type="text" placeholder="Tìm theo mã hoặc tên chức năng..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 focus:border-sap-blue/50 rounded-lg outline-none py-1.5 pl-3 pr-8 text-xs text-foreground placeholder:text-foreground/30 transition-all focus:bg-white/[0.08]" />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-30 text-xs">🔍</span>
        </div>
      </div>

      {/* TREE TABLE VIEW */}
      <div className="overflow-x-auto border border-white/[0.06] bg-white/[0.01] rounded-xl max-h-[520px] overflow-y-auto shadow-inner">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="bg-white/[0.03] text-foreground/50 text-xs font-medium uppercase tracking-wider sticky top-0 backdrop-blur-xl z-20 border-b border-white/[0.06]">
              <th className="py-3 px-5 min-w-[360px]">Tên đối tượng chức năng</th>
              <th className="py-3 px-2 text-center w-20">ALL</th>
              <th className="py-3 px-2 text-center w-20">Xem</th>
              <th className="py-3 px-2 text-center w-20">Thêm</th>
              <th className="py-3 px-2 text-center w-20">Sửa</th>
              <th className="py-3 px-2 text-center w-20">Xóa</th>
              <th className="py-3 px-2 text-center w-20">Duyệt</th>
              <th className="py-3 px-2 text-center w-20">In</th>
              <th className="py-3 px-2 text-center w-20">Đơn giá</th>
              <th className="py-3 px-2 text-center w-20">In lại</th>
              <th className="py-3 px-2 text-center w-20">Chủ quản</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {processedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-xs text-foreground/30 italic">Không tìm thấy dữ liệu quyền hạn phù hợp.</td>
              </tr>
            ) : (
              renderTreeRows(processedData)
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER ACTION */}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={handleSavePermissions} disabled={isSubmitting} className="px-5 py-2 bg-sap-blue hover:bg-sap-blue/90 disabled:opacity-40 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-md shadow-sap-blue/10 active:scale-95">
          {isSubmitting ? 'Đang cập nhật hệ thống...' : 'Xác nhận gán quyền'}
        </button>
      </div>
    </div>
  );
}