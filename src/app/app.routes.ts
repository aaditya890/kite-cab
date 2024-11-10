import { Routes } from '@angular/router';
import { HomeComponent } from '../app/home/home.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    {
        path:'ec-admin00',
        loadComponent: ()=> import('../app/admin-panel/admin-panel.component').then((m) => m.AdminPanelComponent),
        canActivate:[authGuard]
    },
    {
       path:'home',
       loadComponent: ()=> import('../app/home/home.component').then((m) => m.HomeComponent) 
    },
    {
        path:'',
        pathMatch:'full',
        redirectTo:'home'
    }
];
