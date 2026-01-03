import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'vyracare-wrapper',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WrapperComponent {
  protected readonly notificationsOpen = signal(false);
  protected readonly logoMenuOpen = signal(false);

  constructor(private readonly authService: AuthService) {}

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.logoMenuOpen.set(false);
    this.notificationsOpen.update((value) => !value);
  }

  toggleLogoMenu(event: Event) {
    event.stopPropagation();
    this.notificationsOpen.set(false);
    this.logoMenuOpen.update((value) => !value);
  }

  logout() {
    this.logoMenuOpen.set(false);
    this.authService.logout();
  }

  @HostListener('document:click')
  closeNotifications() {
    this.notificationsOpen.set(false);
    this.logoMenuOpen.set(false);
  }
}
