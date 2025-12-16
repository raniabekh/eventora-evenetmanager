package com.example.eventservice.service;

import com.example.eventservice.model.Event;
import com.example.eventservice.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository repo;

    public EventService(EventRepository repo) {
        this.repo = repo;
    }

    public Optional<Event> getById(Long id) {
        return repo.findById(id);
    }

    public List<Event> getEventsByOrganizer(Long organizerId) {
        return repo.findByOrganizerId(organizerId);
    }

    public List<Event> search(
            String keyword,
            String category,
            String location,
            String minDate,
            String maxDate,
            Double maxPrice
    ) {
        List<Event> base = repo.findByIsActiveTrue();

        if (keyword != null && !keyword.isBlank()) {
            base = repo.searchByKeyword(keyword);
        }

        if (category != null && !category.isBlank()) {
            base = base.stream()
                    .filter(e -> category.equalsIgnoreCase(e.getCategory()))
                    .collect(Collectors.toList());
        }

        if (location != null && !location.isBlank()) {
            String loc = location.toLowerCase();
            base = base.stream()
                    .filter(e -> e.getLocation() != null &&
                            e.getLocation().toLowerCase().contains(loc))
                    .collect(Collectors.toList());
        }

        if (minDate != null && !minDate.isBlank()) {
            LocalDateTime min = LocalDateTime.parse(minDate);
            base = base.stream()
                    .filter(e -> !e.getDate().isBefore(min))
                    .collect(Collectors.toList());
        }

        if (maxDate != null && !maxDate.isBlank()) {
            LocalDateTime max = LocalDateTime.parse(maxDate);
            base = base.stream()
                    .filter(e -> !e.getDate().isAfter(max))
                    .collect(Collectors.toList());
        }

        if (maxPrice != null) {
            base = base.stream()
                    .filter(e -> (e.getPrice() != null ? e.getPrice() : 0.0) <= maxPrice)
                    .collect(Collectors.toList());
        }

        return base;
    }

    public void incrementParticipants(Long eventId) {
        Event event = repo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        int current = event.getCurrentParticipants() == null ? 0 : event.getCurrentParticipants();
        int max = event.getMaxParticipants() == null ? 0 : event.getMaxParticipants();

        if (max > 0 && current >= max) {
            throw new RuntimeException("Event is full");
        }

        event.setCurrentParticipants(current + 1);
        repo.save(event);
    }

    public void decrementParticipants(Long eventId) {
        Event event = repo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        int current = event.getCurrentParticipants() == null ? 0 : event.getCurrentParticipants();
        event.setCurrentParticipants(Math.max(0, current - 1));
        repo.save(event);
    }
}
