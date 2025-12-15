package com.example.eventservice.controller;

import com.example.eventservice.model.Event;
import com.example.eventservice.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<Event>> getEvents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location) {
        List<Event> events = eventService.searchEvents(keyword, category, location);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<Event>> getEventsByOrganizer(
            @PathVariable Long organizerId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if (userId != null && !organizerId.equals(userId) && !"ADMIN".equals(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Event> events = eventService.getEventsByOrganizer(organizerId);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/organizer/{organizerId}/stats")
    public ResponseEntity<Map<String, Object>> getOrganizerStats(@PathVariable Long organizerId) {
        List<Event> events = eventService.getEventsByOrganizer(organizerId);

        long totalEvents = events.size();
        long upcomingEvents = events.stream()
                .filter(e -> e.getDate().isAfter(LocalDateTime.now()))
                .count();
        long pastEvents = totalEvents - upcomingEvents;

        int totalParticipants = events.stream()
                .mapToInt(e -> e.getMaxParticipants() != null ? e.getMaxParticipants() : 0)
                .sum();

        double totalRevenue = events.stream()
                .mapToDouble(e -> {
                    int participants = e.getMaxParticipants() != null ? e.getMaxParticipants() : 0;
                    double price = 0.0;
                    return participants * price;
                })
                .sum();

        double averageAttendance = events.stream()
                .filter(e -> e.getMaxParticipants() != null && e.getMaxParticipants() > 0)
                .mapToDouble(e -> {
                    int participants = e.getMaxParticipants() != null ? e.getMaxParticipants() : 0;
                    return (double) participants / e.getMaxParticipants() * 100;
                })
                .average()
                .orElse(0.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEvents", totalEvents);
        stats.put("upcomingEvents", upcomingEvents);
        stats.put("pastEvents", pastEvents);
        stats.put("totalParticipants", totalParticipants);
        stats.put("totalRevenue", totalRevenue);
        stats.put("averageAttendance", Math.round(averageAttendance));

        return ResponseEntity.ok(stats);
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(
            @RequestBody Event event,
            @RequestHeader(value = "X-User-Id", required = false) Long organizerId) {
        if (organizerId != null) {
            event.setOrganizerId(organizerId);
        }
        Event saved = eventService.createEvent(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event eventDetails) {
        try {
            Event updated = eventService.updateEvent(id, eventDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
