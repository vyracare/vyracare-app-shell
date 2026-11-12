import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { VcButtonComponent, VcHeadingComponent, VcTextComponent, VcToastService } from '@vyracare/design-system';

import { ShellNotification } from '../../models/shell-notification.model';
import { NotificationCenterService } from '../../services/notification-center/notification-center.service';

@Component({
  selector: 'vyracare-notifications',
  standalone: true,
  imports: [DatePipe, VcButtonComponent, VcHeadingComponent, VcTextComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit {
  private readonly notificationCenter = inject(NotificationCenterService);
  protected readonly notifications = this.notificationCenter.items;

  constructor(
    private readonly router: Router,
    private readonly toast: VcToastService
  ) {}

  ngOnInit(): void {
    this.notificationCenter.start();
  }

  protected open(notification: ShellNotification): void {
    this.notificationCenter.markAsRead(notification).subscribe({
      next: () => void this.router.navigateByUrl(notification.route),
      error: () => this.toast.error('Nao foi possivel atualizar a notificacao', 'Tente novamente em instantes.')
    });
  }
}
