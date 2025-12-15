package com.example.notificationservice.service;

import com.example.notificationservice.model.Notification;
import com.example.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    // Méthodes pour les types de notifications spécifiques
    public Notification sendRegistrationConfirmation(Long userId, Long eventId, String eventTitle) {
        Notification notification = new Notification(
                userId,
                "Confirmation d'inscription",
                "Votre inscription à l'événement \"" + eventTitle + "\" a été confirmée.",
                "CONFIRMATION",
                eventId
        );
        return notificationRepository.save(notification);
    }

    public Notification sendEventReminder(Long userId, Long eventId, String eventTitle) {
        Notification notification = new Notification(
                userId,
                "Rappel d'événement",
                "N'oubliez pas : l'événement \"" + eventTitle + "\" approche!",
                "REMINDER",
                eventId
        );
        return notificationRepository.save(notification);
    }
}

