import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/pages/login/login';
import { MainLayout } from './layouts/main-layout/main-layout';
import { PermissionComponent } from './features/system/pages/permission/permission.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  { 
    path: 'app', 
    component: MainLayout,
    children: [
      { path: 'system/permission', component: PermissionComponent },
      // Nơi chứa các sub-routes của các module con (HR, CRM, Product,...)
    ] 
  },

  // Route fallback cho các URL không tồn tại
  { path: '**', redirectTo: 'login' }
];