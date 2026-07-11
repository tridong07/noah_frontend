'use client';
import { useState, useEffect } from 'react';

export interface PermissionNode {
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

export type FilterType = 'all' | 'selected' | 'unselected';

export function usePermissionTree(initialSafe?: PermissionNode[]) {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [treeData, setTreeData] = useState<PermissionNode[]>([]);
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
        const hasRights = node.view || node.add || node.edit || node.delete || node.print || node.run || node.adm || node.reprn || node.man;
        
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

  const processedData = filterTree(treeData);

  return {
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
    collapsedIds,
    toggleCollapse,
    handleCollapseAll,
    handleCheckboxChange,
    processedData,
    getFlattenedData: () => flattenTreeData(treeData)
  };
}