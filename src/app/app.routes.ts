import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { FirstAccessComponent } from './pages/first-access/first-access.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ErrorComponent } from './pages/error/error.component';
import { environment } from '../environments/environments';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'first-access', component: FirstAccessComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: environment.dashboardRemoteEntry,
        exposedModule: './App'
      })
        .then((m) => m.App)
        .catch((err) => {
          console.error('Nao foi possivel carregar o dashboard remoto', err);
          return ErrorComponent;
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
          return [ { path: '', component: ErrorComponent } ];
        })
  },
  {
    path: 'cadastro/pacientes',
    canActivate: [AuthGuard],
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: environment.userRemoteEntry,
        exposedModule: './Routes'
      })
        .then((m) => m.ROUTES ?? m.routes ?? [])
        .catch((err) => {
          console.error('Nao foi possivel carregar o cadastro de pacientes', err);
          return [ { path: '', component: ErrorComponent } ];
        })
  }
];
