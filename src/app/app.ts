import { ChangeDetectionStrategy, Component, DestroyRef, computed, signal } from '@angular/core';
import { WrapperComponent } from './components/wrapper/wrapper.component';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VcToastContainerComponent } from '@vyracare/design-system';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, WrapperComponent, RouterOutlet, VcToastContainerComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly authRoutes = ['/login', '/register', '/first-access', '/forgot-password'];
  private readonly shellVisible = signal(true);
  protected readonly showShell = computed(() => this.shellVisible());

  constructor(private router: Router, destroyRef: DestroyRef) {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(() => this.updateShellVisibility());

    this.updateShellVisibility();
  }

  private updateShellVisibility(): void {
    const currentUrl = this.router.url.split('?')[0];
    this.shellVisible.set(!this.authRoutes.includes(currentUrl));
  }
}
