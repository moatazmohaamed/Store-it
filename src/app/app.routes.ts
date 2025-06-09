import { Routes } from '@angular/router';
import { Notfound } from './pages/notfound/notfound';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./layout/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
      {
        path: 'sign-in',
        loadComponent: () =>
          import('./pages/auth/sign-in/sign-in').then((m) => m.SignIn),
        title: 'Sign in',
      },
      {
        path: 'sign-up',
        loadComponent: () =>
          import('./pages/auth/sign-up/sign-up').then((m) => m.SignUp),
        title: 'Sign up',
      },
    ],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard',
    canActivate: [authGuard],
    children: [
      {
        path: ':type',
        loadComponent: () =>
          import('./pages/file-list/file-list').then((m) => m.FileList),
        title: 'Files',
      },
    ],
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', component: Notfound, title: 'Not Found' },
];
