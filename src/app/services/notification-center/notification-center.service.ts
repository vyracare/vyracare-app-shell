import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, forkJoin, map, Observable, of, Subscription, switchMap, tap, timer } from 'rxjs';

import { environment } from '../../../environments/environments';
import {
  AppointmentNotificationApiResponse,
  FinanceNotificationApiResponse,
  ShellNotification
} from '../../models/shell-notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationCenterService {
  readonly items = signal<ShellNotification[]>([]);
  private started = false;
  private pollingSubscription?: Subscription;

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  /** Starts a single polling stream for all notification sources owned by the shell. */
  start(): void {
    if (this.started || !isPlatformBrowser(this.platformId)) return;
    this.started = true;

    this.pollingSubscription = timer(0, 60_000)
      .pipe(switchMap(() => forkJoin([this.loadAppointments(), this.loadFinance()])))
      .subscribe(([appointments, finance]) => {
        this.items.set([...appointments, ...finance].sort((left, right) =>
          right.occurredAt.localeCompare(left.occurredAt)
        ));
      });
  }

  /** Stops background requests when the authenticated shell is left. */
  stop(): void {
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = undefined;
    this.started = false;
    this.items.set([]);
  }

  /** Acknowledges a notification in its source API and removes it from the unread collection. */
  markAsRead(notification: ShellNotification): Observable<void> {
    const request = notification.source === 'appointment'
      ? this.http.post<void>(`${environment.appointmentsApiUrl}/${notification.sourceId}/notifications/read`, {})
      : this.http.post<void>(`${environment.financeApiUrl}/notifications/${notification.sourceId}/read`, {});

    return request.pipe(tap(() => this.items.update(items => items.filter(item => item.id !== notification.id))));
  }

  /** Forces an immediate refresh after a screen changes notification-producing data. */
  refresh(): void {
    forkJoin([this.loadAppointments(), this.loadFinance()]).subscribe(([appointments, finance]) => {
      this.items.set([...appointments, ...finance].sort((left, right) =>
        right.occurredAt.localeCompare(left.occurredAt)
      ));
    });
  }

  private loadAppointments(): Observable<ShellNotification[]> {
    if (!environment.appointmentsApiUrl) return of([]);
    return this.http
      .get<AppointmentNotificationApiResponse[]>(`${environment.appointmentsApiUrl}/notifications/unread`)
      .pipe(
        map(items => items.map(item => ({
          id: `appointment:${item.appointmentId}`,
          source: 'appointment' as const,
          sourceId: item.appointmentId,
          title: item.title,
          description: item.message,
          time: this.formatDate(item.startsAt),
          route: '/dashboard/agenda',
          occurredAt: item.reminderAt
        }))),
        catchError(() => of([]))
      );
  }

  private loadFinance(): Observable<ShellNotification[]> {
    if (!environment.financeApiUrl) return of([]);
    return this.http
      .get<FinanceNotificationApiResponse[]>(`${environment.financeApiUrl}/notifications/unread`)
      .pipe(
        map(items => items.map(item => ({
          id: `finance:${item.id}`,
          source: 'finance' as const,
          sourceId: item.id,
          title: item.title,
          description: item.message,
          time: this.formatDate(item.dueAt),
          route: item.route,
          occurredAt: item.dueAt
        }))),
        catchError(() => of([]))
      );
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  }
}
