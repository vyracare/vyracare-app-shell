import { discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { environment } from '../../../environments/environments';
import { NotificationCenterService } from './notification-center.service';

describe('NotificationCenterService', () => {
  let service: NotificationCenterService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(NotificationCenterService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should aggregate unread appointments and finance notifications', fakeAsync(() => {
    service.refresh();

    http.expectOne(`${environment.appointmentsApiUrl}/notifications/unread`).flush([{
      appointmentId: 'appointment-1', title: 'Atendimento', message: 'Comeca em breve',
      startsAt: '2026-11-11T15:00:00Z', reminderAt: '2026-11-11T14:00:00Z'
    }]);
    http.expectOne(`${environment.financeApiUrl}/notifications/unread`).flush([{
      id: 'invoice-1', title: 'Boleto', message: 'Vence hoje', dueAt: '2026-11-12T00:00:00Z',
      severity: 'warning', route: '/financeiro/boletos'
    }]);
    expect(service.items().map(item => item.id)).toEqual(['finance:invoice-1', 'appointment:appointment-1']);
  }));

  it('should remove an item after its source confirms it as read', () => {
    const item = {
      id: 'finance:invoice-1', source: 'finance' as const, sourceId: 'invoice-1', title: 'Boleto',
      description: 'Vence hoje', route: '/financeiro/boletos', occurredAt: '2026-11-12T00:00:00Z'
    };
    service.items.set([item]);

    service.markAsRead(item).subscribe();
    http.expectOne(`${environment.financeApiUrl}/notifications/invoice-1/read`).flush(null);

    expect(service.items()).toEqual([]);
  });

  it('should acknowledge appointment notifications in the appointments API', () => {
    const item = {
      id: 'appointment:1', source: 'appointment' as const, sourceId: '1', title: 'Atendimento',
      description: 'Comeca em breve', route: '/dashboard/agenda', occurredAt: '2026-11-12T00:00:00Z'
    };
    service.items.set([item]);
    service.markAsRead(item).subscribe();
    http.expectOne(`${environment.appointmentsApiUrl}/1/notifications/read`).flush(null);
    expect(service.items()).toEqual([]);
  });

  it('should isolate source failures and keep an empty collection', () => {
    service.refresh();
    http.expectOne(`${environment.appointmentsApiUrl}/notifications/unread`).flush({}, { status: 503, statusText: 'Unavailable' });
    http.expectOne(`${environment.financeApiUrl}/notifications/unread`).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(service.items()).toEqual([]);
  });

  it('should skip notification sources without configured URLs', () => {
    const appointmentsUrl = environment.appointmentsApiUrl;
    const financeUrl = environment.financeApiUrl;
    environment.appointmentsApiUrl = '';
    environment.financeApiUrl = '';
    service.refresh();
    expect(service.items()).toEqual([]);
    environment.appointmentsApiUrl = appointmentsUrl;
    environment.financeApiUrl = financeUrl;
  });

  it('should start only one polling stream', fakeAsync(() => {
    service.start();
    tick();
    http.expectOne(`${environment.appointmentsApiUrl}/notifications/unread`).flush([]);
    http.expectOne(`${environment.financeApiUrl}/notifications/unread`).flush([]);
    service.start();
    http.expectNone(`${environment.appointmentsApiUrl}/notifications/unread`);
    service.stop();
    expect(service.items()).toEqual([]);
  }));
});
