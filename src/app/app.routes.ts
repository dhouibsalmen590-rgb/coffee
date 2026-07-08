import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CaisseComponent } from './components/caisse/caisse.component';
import { StockComponent } from './components/stock/stock.component';
import { DepensesComponent } from './components/depenses/depenses.component';
import { HistoriqueComponent } from './components/historique/historique.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'caisse',
    component: CaisseComponent,
    canActivate: [authGuard]
  },
  {
    path: 'stock',
    component: StockComponent,
    canActivate: [authGuard]
  },
  {
    path: 'depenses',
    component: DepensesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'historique',
    component: HistoriqueComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
