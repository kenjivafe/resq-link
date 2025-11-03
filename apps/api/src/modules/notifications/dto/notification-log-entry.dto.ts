export interface NotificationLogEntryDto {
  id: string;
  userId: string;
  incidentId: string | null;
  channel: 'push' | 'sms';
  status: 'pending' | 'delivered' | 'failed' | 'retried';
  errorMessage: string | null;
  sentAt: string;
  payload: Record<string, unknown>;
}
