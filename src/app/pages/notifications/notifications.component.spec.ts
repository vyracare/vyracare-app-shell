import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { VcToastService } from '@vyracare/design-system';
import { of, throwError } from 'rxjs';

import { NotificationCenterService } from '../../services/notification-center/notification-center.service';
import { NotificationsComponent } from './notifications.component';

describe('NotificationsComponent', () => {
  const notification = {
    id: 'finance:1', source: 'finance' as const, sourceId: '1', title: 'Boleto', description: 'Vence hoje',
    route: '/financeiro/boletos', occurredAt: '2026-11-11T12:00:00Z'
  };
  const center = { items: signal([notification]), start: jest.fn(), markAsRead: jest.fn(() => of(void 0)) };
  const router = { navigateByUrl: jest.fn() };
  const toast = { error: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    center.items.set([notification]);
    center.markAsRead.mockReturnValue(of(void 0));
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
      providers: [
        { provide: NotificationCenterService, useValue: center },
        { provide: Router, useValue: router },
        { provide: VcToastService, useValue: toast }
      ]
    }).compileComponents();
  });

  it('should start the center and render only unread items', () => {
    const fixture = TestBed.createComponent(NotificationsComponent);
    fixture.detectChanges();
    expect(center.start).toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Boleto');
  });

  it('should mark a notification as read before navigation', () => {
    const fixture = TestBed.createComponent(NotificationsComponent);
    fixture.componentInstance['open'](notification);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/financeiro/boletos');
  });

  it('should report an acknowledgement failure', () => {
    center.markAsRead.mockReturnValue(throwError(() => new Error('failed')));
    const fixture = TestBed.createComponent(NotificationsComponent);
    fixture.componentInstance['open'](notification);
    expect(toast.error).toHaveBeenCalled();
  });
});
