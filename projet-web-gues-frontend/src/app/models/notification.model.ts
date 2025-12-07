// src/app/models/notification.model.ts
export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: any; // Données supplémentaires
  read: boolean;
  createdAt: string;
  icon?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export type NotificationType =
  | 'registration_confirmed'   // Inscription confirmée
  | 'event_reminder'           // Rappel événement
  | 'event_updated'            // Événement modifié
  | 'event_cancelled'          // Événement annulé
  | 'new_event'                // Nouvel événement
  | 'message'                  // Message personnel
  | 'system'                   // Notification système
  | 'promotion';               // Promotion/spécial

export interface NotificationCount {
  total: number;
  unread: number;
  byType?: {
    [key in NotificationType]?: number; // Rendre optionnel
  };
}
