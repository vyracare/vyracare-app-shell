import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

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

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.notificationsOpen.update((value) => !value);
  }

  @HostListener('document:click')
  closeNotifications() {
    this.notificationsOpen.set(false);
  }
}
