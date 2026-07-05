import { useState, useRef, useEffect, useMemo } from "react";
import { MenuNode } from "@/hooks/useMenuData";
import { useRouter } from "next/navigation";
import { useMenuContext } from "@/context/MenuContext";
import { useNotification } from "@/context/NotificationContext";

export const useLaunchpad = (menuData: MenuNode[] | undefined, searchTerm: string) => {
  const router = useRouter();
  const { setBreadcrumbs } = useMenuContext();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stack, setStack] = useState<MenuNode[]>([]);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const { show } = useNotification();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // activeGroup luôn là phần tử cuối của stack
  const activeGroup = stack.length > 0 ? stack[stack.length - 1] : null;

  useEffect(() => {
    const saved = localStorage.getItem("fav_menus");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const pushStack = (item: MenuNode) => {
    const nextStack = [...stack, item];
    setStack(nextStack);
    // Cập nhật Breadcrumb dựa trên stack
    setBreadcrumbs(["Home", ...nextStack.map(s => s.menuName)]);
  };

  const popStack = () => {
    const nextStack = stack.slice(0, -1);
    setStack(nextStack);
    // Cập nhật Breadcrumb khi quay lại
    setBreadcrumbs(nextStack.length > 0 ? ["Home", ...nextStack.map(s => s.menuName)] : ["Home"]);
  };

  const toggleFavorite = (e: React.MouseEvent, menuNo: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(menuNo) ? prev.filter(id => id !== menuNo) : [...prev, menuNo];
      localStorage.setItem("fav_menus", JSON.stringify(next));
      return next;
    });
  };

  const toggleCollapse = (menuNo: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(menuNo)) next.delete(menuNo);
      else next.add(menuNo);
      return next;
    });
  };

  const handleTileClick = (item: MenuNode) => {
    const isPathValid = (item: MenuNode) => {
      // Ví dụ: kiểm tra nếu cả winNo và menuNo đều trống thì coi là không tồn tại
      return !!(item.winNo || item.menuNo);
    };

    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      if (!isPathValid(item)) {
        show("Chức năng này hiện chưa được cấu hình hoặc không tồn tại.", "Thông báo", "error");
        return;
      }
      item.winNo ? router.push(`/modules/${item.winNo.toLowerCase()}`) : router.push(`/home/${item.menuNo}`);
      return;
    }

    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      if (item.children && item.children.length > 0) {
        pushStack(item); // Sử dụng pushStack thay vì setActiveGroup
      } else {
        if (!isPathValid(item)) {
          show("Chức năng này hiện chưa được cấu hình hoặc không tồn tại.", "Thông báo", "error");
          return;
        }
        setBreadcrumbs(["Home", ...stack.map(s => s.menuName), item.menuName]);
        item.winNo ? router.push(`/modules/${item.winNo.toLowerCase()}`) : router.push(`/home/${item.menuNo}`);
      }
    }, 250);
  };

  const processedData = useMemo(() => {
    if (!menuData) return { groups: [], displayItems: [], favItems: [] };

    const allItems: MenuNode[] = [];
    const collect = (n: MenuNode[]) => n.forEach(i => { allItems.push(i); if (i.children) collect(i.children); });
    collect(menuData);

    // Danh sách hiển thị dựa trên cấp hiện tại
    const searchScope = activeGroup ? (activeGroup.children || []) : menuData;
    const filtered = searchScope.filter(m => m.menuName.toLowerCase().includes(searchTerm.toLowerCase()));

    return {
      groups: menuData, // Giữ nguyên cấu trúc phân cấp gốc để render ở Root
      displayItems: filtered, // Danh sách con đã lọc (để dùng khi ở sub-level)
      favItems: allItems.filter(i => favorites.includes(i.menuNo))
    };
  }, [menuData, searchTerm, favorites, activeGroup]);

  return { 
    ...processedData, 
    favorites, 
    activeGroup, // Giờ đây activeGroup được tính từ stack
    handleTileClick, 
    toggleFavorite, 
    popStack, 
    toggleCollapse,
    collapsedGroups,
    stack 
  };
};