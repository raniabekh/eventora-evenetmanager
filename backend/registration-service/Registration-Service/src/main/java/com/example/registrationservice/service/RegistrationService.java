package com.example.registrationservice.service;

import com.example.registrationservice.dto.RegistrationRequest;
import com.example.registrationservice.model.Registration;
import com.example.registrationservice.repository.RegistrationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;

    public RegistrationService(RegistrationRepository registrationRepository) {
        this.registrationRepository = registrationRepository;
    }

    // ===== REGISTER =====
    public Registration registerToEvent(Long eventId, Long userId, RegistrationRequest req) {

        registrationRepository.findByEventIdAndUserId(eventId, userId)
                .ifPresent(r -> {
                    throw new RuntimeException("Utilisateur déjà inscrit à cet événement");
                });

        Registration registration = new Registration();
        registration.setEventId(eventId);
        registration.setUserId(userId);

        registration.setParticipantName(req.participantName);
        registration.setParticipantEmail(req.participantEmail);
        registration.setParticipantPhone(req.participantPhone);
        registration.setNotes(req.notes);

        registration.setStatus("CONFIRMED");

        return registrationRepository.save(registration);
    }

    // ===== CANCEL =====
    public void cancelRegistration(Long registrationId, Long userId, String role) {

        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        if (!reg.getUserId().equals(userId) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new RuntimeException("Accès refusé");
        }

        reg.setStatus("CANCELLED");
        registrationRepository.save(reg);
    }

    // ===== READ =====
    public List<Registration> getUserRegistrations(Long userId) {
        return registrationRepository.findByUserId(userId);
    }

    public List<Registration> getEventRegistrations(Long eventId) {
        return registrationRepository.findByEventId(eventId);
    }
}

