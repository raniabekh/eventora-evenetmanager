// EventController.java - AJOUTER CES MÉTHODES
@GetMapping("/organizer/{organizerId}")
public ResponseEntity<List<Event>> getEventsByOrganizer(
        @PathVariable Long organizerId,
        @RequestHeader("X-User-Id") Long userId,
        @RequestHeader("X-User-Role") String userRole) {

    if (!organizerId.equals(userId) && !"ADMIN".equals(userRole)) {
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
            .filter(e -> e.getMaxParticipants() > 0)
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