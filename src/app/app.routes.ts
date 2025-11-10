import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ErrorComponent } from './pages/error/error.component';
import { environment } from '../environments/environments';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
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
          console.error('Não foi possível carregar o dashboard remoto', err);
          return ErrorComponent;
        })
  },
];
