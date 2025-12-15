package com.example.notificationservice.controller;

import com.example.notificationservice.model.Notification;
import com.example.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification saved = notificationService.createNotification(notification);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@PathVariable Long userId) {
        Long count = notificationService.getUnreadCount(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }

    // Endpoints pour notifications automatiques
    @PostMapping("/registration-confirmation")
    public ResponseEntity<Notification> sendRegistrationConfirmation(
            @RequestParam Long userId,
            @RequestParam Long eventId,
            @RequestParam String eventTitle) {
        Notification notification = notificationService.sendRegistrationConfirmation(userId, eventId, eventTitle);
        return ResponseEntity.ok(notification);
    }

    @PostMapping("/event-reminder")
    public ResponseEntity<Notification> sendEventReminder(
            @RequestParam Long userId,
            @RequestParam Long eventId,
            @RequestParam String eventTitle) {
        Notification notification = notificationService.sendEventReminder(userId, eventId, eventTitle);
        return ResponseEntity.ok(notification);
    }
}