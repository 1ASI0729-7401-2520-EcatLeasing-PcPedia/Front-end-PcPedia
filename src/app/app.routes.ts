import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/components/layout/layout';
import { Login } from './features/login/login';
import { AuthGuard } from './core/guards/auth.guard';

import { HomeComponent } from './shared/presentation/views/home/home';
import { Reports } from './shared/presentation/views/reports/reports';
import { Contracts } from './shared/presentation/views/contracts/contracts';
import { Profile } from './shared/presentation/views/profile/profile';

export const routes: Routes = [
  // Página inicial: Login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Login fuera del layout
  { path: 'login', component: Login },

  // Layout protegido (solo visible tras autenticación)
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard],
    children: [
      { path: 'inicio', component: HomeComponent },
      { path: 'informes', component: Reports },
      { path: 'contratos', component: Contracts },
      { path: 'perfil', component: Profile }
    ]
  },

  // Rutas no válidas redirigen al login
  { path: '**', redirectTo: 'login' }
];
