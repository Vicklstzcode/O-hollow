import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard'; // Importe o guarda

import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { FavoritosComponent } from './pages/favoritos/favoritos.component';
import { DetalhesComponent } from './pages/detalhes/detalhes.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UniversoComponent } from './pages/universo/universo.component';
import { PerfilComponent } from './pages/perfil/perfil.component';

export const routes: Routes = [
    // Rota padrão redireciona para login
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    
    // Login é PÚBLICO (não tem canActivate)
    { path: 'login', component: LoginComponent },

    // Rotas PROTEGIDAS (tem canActivate: [authGuard])
    { 
      path: 'home', 
      component: HomeComponent, 
      canActivate: [authGuard] 
    },
    { 
      path: 'favoritos', 
      component: FavoritosComponent, 
      canActivate: [authGuard] 
    },
    { 
      path: 'dashboard', 
      component: DashboardComponent, 
      canActivate: [authGuard] 
    },
    { 
      path: 'detalhes/:id', 
      component: DetalhesComponent, 
      canActivate: [authGuard] 
    },
    { 
      path: 'universo/:nome', 
      component: UniversoComponent, 
      canActivate: [authGuard] 
    },

    {
      path: 'perfil', 
      component: PerfilComponent, 
      canActivate: [authGuard] 
    },

    // Qualquer rota desconhecida vai para o login
    { path: '**', redirectTo: 'login' }
];