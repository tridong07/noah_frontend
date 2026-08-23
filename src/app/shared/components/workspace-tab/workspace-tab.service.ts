import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CrmMenuItem } from '../../models/crm-module.model';

export interface WorkspaceTab {
  id: string;          
  title: string;       
  route: string;       
  menuItem?: CrmMenuItem; 
  isDirty?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WorkspaceTabService {
  private STORAGE_KEY = 'workspace_tabs_data';
  private ACTIVE_TAB_KEY = 'workspace_active_tab_id';

  private tabsSubject = new BehaviorSubject<WorkspaceTab[]>(this.loadStoredTabs());
  tabs$ = this.tabsSubject.asObservable();

  private activeTabIdSubject = new BehaviorSubject<string>(this.loadStoredActiveTab());
  activeTabId$ = this.activeTabIdSubject.asObservable();

  private loadStoredTabs(): WorkspaceTab[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  private loadStoredActiveTab(): string {
    try {
      return localStorage.getItem(this.ACTIVE_TAB_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  private saveToStorage(tabs: WorkspaceTab[], activeId: string) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tabs));
      localStorage.setItem(this.ACTIVE_TAB_KEY, activeId);
    } catch (e) {
      console.warn('Không thể lưu trạng thái tab vào localStorage', e);
    }
  }

  openTab(tab: WorkspaceTab) {
    const currentTabs = this.tabsSubject.getValue();
    const exists = currentTabs.find(t => t.id === tab.id);

    let updatedTabs: WorkspaceTab[];
    if (!exists) {
      updatedTabs = [...currentTabs, tab];
    } else {
      updatedTabs = currentTabs.map(t => t.id === tab.id ? { ...t, menuItem: tab.menuItem } : t);
    }

    this.tabsSubject.next(updatedTabs);
    this.activeTabIdSubject.next(tab.id);
    this.saveToStorage(updatedTabs, tab.id);
  }

  closeTab(tabId: string, routerNavigateFn: (nextRoute: string) => void) {
    let currentTabs = this.tabsSubject.getValue();
    const index = currentTabs.findIndex(t => t.id === tabId);
    
    if (index === -1) return;

    currentTabs = currentTabs.filter(t => t.id !== tabId);
    this.tabsSubject.next(currentTabs);

    let nextActiveId = this.activeTabIdSubject.getValue();
    if (nextActiveId === tabId) {
      if (currentTabs.length > 0) {
        const nextTab = currentTabs[index - 1] || currentTabs[0];
        nextActiveId = nextTab.id;
        this.activeTabIdSubject.next(nextActiveId);
        routerNavigateFn(nextTab.route);
      } else {
        nextActiveId = '';
        this.activeTabIdSubject.next('');
        routerNavigateFn('/app'); 
      }
    }
    this.saveToStorage(currentTabs, nextActiveId);
  }

  setActiveTab(tabId: string) {
    this.activeTabIdSubject.next(tabId);
    const currentTabs = this.tabsSubject.getValue();
    this.saveToStorage(currentTabs, tabId);
  }

  updateTabStatus(tabId: string, isDirty: boolean) {
    const currentTabs = this.tabsSubject.getValue();
    const updatedTabs = currentTabs.map(t => 
      t.id === tabId ? { ...t, isDirty } : t
    );
    this.tabsSubject.next(updatedTabs);
    // Không cần lưu vào LocalStorage nếu không muốn trạng thái dirty tồn tại sau khi F5
  }
}