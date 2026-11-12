import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { AuthGuard } from './guards/auth.guard';
import { FinanceGuard } from './guards/finance.guard';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { FirstAccessComponent } from './pages/first-access/first-access.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ErrorComponent } from './pages/error/error.component';
import { environment } from '../environments/environments';
import { SearchResultsComponent } from './pages/search-results/search-results.component';
import { CompanyOnboardingComponent } from './pages/company-onboarding/company-onboarding.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';

const financeRoutes: Routes = environment.financeRemoteEntry
  ? [{
      path: 'financeiro',
      canActivate: [AuthGuard, FinanceGuard],
      loadChildren: () =>
        loadRemoteModule({
          type: 'module',
          remoteEntry: environment.financeRemoteEntry,
          exposedModule: './Routes'
        })
          .then((m) => m.ROUTES ?? m.routes ?? [])
          .catch((err) => {
            console.error('Nao foi possivel carregar o financeiro', err);
            return [{ path: '**', component: ErrorComponent }];
          })
    }]
  : [];

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'first-access', component: FirstAccessComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'onboarding/empresa', component: CompanyOnboardingComponent, canActivate: [AuthGuard] },
  { path: 'busca', component: SearchResultsComponent, canActivate: [AuthGuard] },
  { path: 'notificacoes', component: NotificationsComponent, canActivate: [AuthGuard] },
  ...financeRoutes,
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: environment.dashboardRemoteEntry,
        exposedModule: './Routes'
      })
        .then((m) => m.ROUTES ?? m.routes ?? [])
        .catch((err) => {
          console.error('Nao foi possivel carregar o dashboard remoto', err);
          return [{ path: '**', component: ErrorComponent }];
        })
  },
  {
    path: 'cadastro/funcionarios',
    canActivate: [AuthGuard],
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: environment.profileRemoteEntry,
        exposedModule: './Routes'
      })
        .then((m) => m.ROUTES ?? m.routes ?? [])
        .catch((err) => {
          console.error('Nao foi possivel carregar o cadastro de funcionarios', err);
          return [{ path: '**', component: ErrorComponent }];
        })
  },
  {
    path: 'pacientes',
    canActivate: [AuthGuard],
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: environment.userRemoteEntry,
        exposedModule: './Routes'
      })
        .then((m) => m.ROUTES ?? m.routes ?? [])
        .catch((err) => {
          console.error('Nao foi possivel carregar pacientes', err);
          return [{ path: '**', component: ErrorComponent }];
        })
  },
  { path: 'cadastro/pacientes', pathMatch: 'full', redirectTo: 'pacientes/cadastro' },
  {
    path: 'cadastro/procedimentos',
    canActivate: [AuthGuard],
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: environment.proceedingsRemoteEntry,
        exposedModule: './Routes'
      })
        .then((m) => m.ROUTES ?? m.routes ?? [])
        .catch((err) => {
          console.error('Nao foi possivel carregar o cadastro de procedimentos', err);
          return [{ path: '**', component: ErrorComponent }];
        })
  }
];
