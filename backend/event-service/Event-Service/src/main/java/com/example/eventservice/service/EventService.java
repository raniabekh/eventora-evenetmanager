package com.example.eventservice.service;

import com.example.eventservice.model.Event;
import com.example.eventservice.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public List<Event> getAllActiveEvents() {
        return eventRepository.findByIsActiveTrue();
    }

    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    public List<Event> getEventsByOrganizer(Long organizerId) {
        return eventRepository.findByOrganizerId(organizerId);
    }

    public List<Event> searchEvents(String keyword, String category, String location) {
        if (keyword != null && !keyword.isEmpty()) {
            return eventRepository.searchByKeyword(keyword);
        } else if (category != null && !category.isEmpty()) {
            return eventRepository.findByCategoryAndIsActiveTrue(category);
        } else if (location != null && !location.isEmpty()) {
            return eventRepository.findByLocationContainingIgnoreCaseAndIsActiveTrue(location);
        }
        return getAllActiveEvents();
    }

    public Event updateEvent(Long id, Event eventDetails) {
        return eventRepository.findById(id)
                .map(event -> {
                    event.setTitle(eventDetails.getTitle());
                    event.setDescription(eventDetails.getDescription());
                    event.setDate(eventDetails.getDate());
                    event.setLocation(eventDetails.getLocation());
                    event.setCategory(eventDetails.getCategory());
                    event.setMediaUrls(eventDetails.getMediaUrls());
                    event.setMaxParticipants(eventDetails.getMaxParticipants());
                    return eventRepository.save(event);
                })
                .orElseThrow(() -> new RuntimeException("Événement non trouvé"));
    }

    public void deleteEvent(Long id) {
        eventRepository.findById(id).ifPresent(event -> {
            event.setIsActive(false);
            eventRepository.save(event);
        });
    }
}