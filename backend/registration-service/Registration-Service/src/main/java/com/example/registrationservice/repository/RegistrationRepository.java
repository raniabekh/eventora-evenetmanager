package com.example.registrationservice.repository;

import com.example.registrationservice.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByEventId(Long eventId);
    List<Registration> findByUserId(Long userId);
    Optional<Registration> findByEventIdAndUserId(Long eventId, Long userId);

    Long countByEventId(Long eventId);
    Long countByEventIdAndStatus(Long eventId, String status);
}
