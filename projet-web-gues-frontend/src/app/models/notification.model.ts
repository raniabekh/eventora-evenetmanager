// src/app/models/notification.model.ts
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  data?: any;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high';
}

// AJOUTEZ TOUS LES TYPES QUE VOUS UTILISEZ
export type NotificationType =
// Types participants (existants dans votre service)
  | 'registration_confirmed'
  | 'event_reminder'
  | 'new_event'
  | 'event_updated'
  | 'event_cancelled'
  | 'system'
  | 'promotion'

  // Types backend (votre microservice)
  | 'CONFIRMATION'
  | 'REMINDER'
  | 'CANCELLATION'
  | 'UPDATE'

  // Types organisateurs (si vous en avez besoin)
  | 'NEW_REGISTRATION'
  | 'REGISTRATION_CANCELLED'
  | 'PARTICIPANT_QUESTION'
  | 'FEEDBACK_RECEIVED'
  | 'EVENT_REMINDER_ORGANIZER'
  | 'EVENT_ANALYTICS_READY'
  | 'CUSTOM_NOTIFICATION';

export interface NotificationCount {
  total: number;
  unread: number;
  byType?: { [key in NotificationType]?: number };
}
