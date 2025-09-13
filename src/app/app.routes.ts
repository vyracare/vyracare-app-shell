import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      loadRemoteModule({
        remoteName: 'dashboard',
        exposedModule: './App'
      }).then(m => m.App)
  },
];
