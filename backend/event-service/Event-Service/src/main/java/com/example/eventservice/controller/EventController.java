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
@CrossOrigin(origins = "http://localhost:4200")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // PUBLIC GET (filters)
    @GetMapping
    public ResponseEntity<List<Event>> getEvents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String minDate,
            @RequestParam(required = false) String maxDate,
            @RequestParam(required = false) Double maxPrice
    ) {
        return ResponseEntity.ok(eventService.search(keyword, category, location, minDate, maxDate, maxPrice));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getById(@PathVariable Long id) {
        return eventService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ORGANIZER
    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<Event>> getEventsByOrganizer(
            @PathVariable Long organizerId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole
    ) {
        if (!organizerId.equals(userId) && !"ADMIN".equalsIgnoreCase(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(eventService.getEventsByOrganizer(organizerId));
    }

    @GetMapping("/organizer/{organizerId}/stats")
    public ResponseEntity<Map<String, Object>> getOrganizerStats(@PathVariable Long organizerId) {
        List<Event> events = eventService.getEventsByOrganizer(organizerId);

        long totalEvents = events.size();
        long upcomingEvents = events.stream()
                .filter(e -> e.getDate() != null && e.getDate().isAfter(LocalDateTime.now()))
                .count();
        long pastEvents = totalEvents - upcomingEvents;

        int totalParticipants = events.stream()
                .mapToInt(e -> e.getCurrentParticipants() != null ? e.getCurrentParticipants() : 0)
                .sum();

        double totalRevenue = events.stream()
                .mapToDouble(e -> {
                    int participants = e.getCurrentParticipants() != null ? e.getCurrentParticipants() : 0;
                    double price = e.getPrice() != null ? e.getPrice() : 0.0;
                    return participants * price;
                })
                .sum();

        double averageAttendance = events.stream()
                .filter(e -> e.getMaxParticipants() != null && e.getMaxParticipants() > 0)
                .mapToDouble(e -> {
                    int participants = e.getCurrentParticipants() != null ? e.getCurrentParticipants() : 0;
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

    // INTERNAL endpoints used by registration-service
    @PostMapping("/{eventId}/increment")
    public ResponseEntity<Void> incrementParticipants(@PathVariable Long eventId) {
        eventService.incrementParticipants(eventId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{eventId}/decrement")
    public ResponseEntity<Void> decrementParticipants(@PathVariable Long eventId) {
        eventService.decrementParticipants(eventId);
        return ResponseEntity.ok().build();
    }
}

