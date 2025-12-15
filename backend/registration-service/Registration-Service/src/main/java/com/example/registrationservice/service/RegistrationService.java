package com.example.registrationservice.service;

import com.example.registrationservice.model.Registration;
import com.example.registrationservice.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    public Registration registerToEvent(Long eventId, Long userId) {
        // Vérifier si déjà inscrit
        Optional<Registration> existing = registrationRepository.findByEventIdAndUserId(eventId, userId);
        if (existing.isPresent()) {
            throw new RuntimeException("Utilisateur déjà inscrit à cet événement");
        }

        Registration registration = new Registration(eventId, userId);
        return registrationRepository.save(registration);
    }

    public void cancelRegistration(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));
        registration.setStatus("CANCELLED");
        registrationRepository.save(registration);
    }

    public List<Registration> getEventRegistrations(Long eventId) {
        return registrationRepository.findByEventId(eventId);
    }

    public List<Registration> getUserRegistrations(Long userId) {
        return registrationRepository.findByUserId(userId);
    }

    public Long getEventParticipantsCount(Long eventId) {
        return registrationRepository.countByEventIdAndStatus(eventId, "CONFIRMED");
    }
}