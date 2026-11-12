import type { VcNotificationItem } from '@vyracare/design-system';

export type ShellNotificationSource = 'appointment' | 'finance';

/** Notification enriched with the source information needed to acknowledge and route it. */
export interface ShellNotification extends VcNotificationItem {
  source: ShellNotificationSource;
  sourceId: string;
  route: string;
  occurredAt: string;
}

export interface AppointmentNotificationApiResponse {
  appointmentId: string;
  title: string;
  message: string;
  startsAt: string;
  reminderAt: string;
}

export interface FinanceNotificationApiResponse {
  id: string;
  title: string;
  message: string;
  dueAt: string;
  severity: string;
  route: string;
}
