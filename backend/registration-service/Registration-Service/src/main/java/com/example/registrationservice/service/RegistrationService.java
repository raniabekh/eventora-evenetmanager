package com.example.registrationservice.service;

import com.example.registrationservice.model.Registration;
import com.example.registrationservice.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    public Registration registerToEvent(Long eventId, Long userId, Registration details) {
        Optional<Registration> existing = registrationRepository.findByEventIdAndUserId(eventId, userId);
        if (existing.isPresent()) {
            throw new RuntimeException("Utilisateur déjà inscrit à cet événement");
        }

        Registration registration = new Registration(eventId, userId);
        registration.setParticipantName(details.getParticipantName());
        registration.setParticipantEmail(details.getParticipantEmail());
        registration.setParticipantPhone(details.getParticipantPhone());
        registration.setNotes(details.getNotes());

        if (details.getStatus() != null) {
            registration.setStatus(details.getStatus());
        }

        return registrationRepository.save(registration);
    }

    public void cancelRegistration(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));
        registration.setStatus("CANCELLED");
        registrationRepository.save(registration);
    }

    public Registration updateStatus(Long registrationId, String status) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));
        registration.setStatus(status);
        return registrationRepository.save(registration);
    }

    public List<Registration> getEventRegistrations(Long eventId) {
        return registrationRepository.findByEventId(eventId);
    }

    public List<Registration> getUserRegistrations(Long userId) {
        return registrationRepository.findByUserId(userId);
    }

    public Optional<Registration> getRegistration(Long eventId, Long userId) {
        return registrationRepository.findByEventIdAndUserId(eventId, userId);
    }

    public Long getEventParticipantsCount(Long eventId) {
        return registrationRepository.countByEventIdAndStatus(eventId, "CONFIRMED");
    }

    public Map<String, Object> getEventStats(Long eventId) {
        long confirmed = registrationRepository.countByEventIdAndStatus(eventId, "CONFIRMED");
        long pending = registrationRepository.countByEventIdAndStatus(eventId, "PENDING");
        long cancelled = registrationRepository.countByEventIdAndStatus(eventId, "CANCELLED");

        Map<String, Object> stats = new HashMap<>();
        stats.put("eventId", eventId);
        stats.put("participantsCount", confirmed);
        stats.put("capacity", 100);
        stats.put("availableSpots", Math.max(0, 100 - confirmed));
        stats.put("pending", pending);
        stats.put("cancelled", cancelled);
        stats.put("lastUpdated", LocalDateTime.now());
        return stats;
    }
}
