package com.example.registrationservice.controller;

import com.example.registrationservice.model.Registration;
import com.example.registrationservice.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registrations")
@CrossOrigin(origins = "*")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    @PostMapping("/events/{eventId}")
    public ResponseEntity<Registration> registerToEvent(
            @PathVariable Long eventId,
            @RequestBody Registration registration,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        Long effectiveUserId = registration.getUserId() != null ? registration.getUserId() : userId;
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Registration saved = registrationService.registerToEvent(eventId, effectiveUserId, registration);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{registrationId}")
    public ResponseEntity<Void> cancelRegistration(@PathVariable Long registrationId) {
        registrationService.cancelRegistration(registrationId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{registrationId}/status")
    public ResponseEntity<Registration> updateStatus(
            @PathVariable Long registrationId,
            @RequestBody Map<String, String> payload) {
        Registration updated = registrationService.updateStatus(registrationId, payload.getOrDefault("status", "PENDING"));
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getRegistrationStatus(
            @RequestParam Long eventId,
            @RequestParam Long userId) {
        Map<String, Object> response = new HashMap<>();
        return registrationService.getRegistration(eventId, userId)
                .map(reg -> {
                    response.put("isRegistered", true);
                    response.put("registrationId", reg.getId());
                    response.put("status", reg.getStatus());
                    response.put("registrationDate", reg.getRegistrationDate());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    response.put("isRegistered", false);
                    return ResponseEntity.ok(response);
                });
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Registration>> getUserRegistrations(@PathVariable Long userId) {
        return ResponseEntity.ok(registrationService.getUserRegistrations(userId));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Registration>> getEventRegistrations(
            @PathVariable Long eventId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        if (userId != null && !"ADMIN".equals(userRole)) {
            // TODO: vérifier que userId est bien l'organisateur de l'événement
        }
        List<Registration> registrations = registrationService.getEventRegistrations(eventId);
        return ResponseEntity.ok(registrations);
    }

    @GetMapping("/event/{eventId}/export")
    public ResponseEntity<byte[]> exportEventRegistrations(@PathVariable Long eventId) {
        List<Registration> registrations = registrationService.getEventRegistrations(eventId);

        StringBuilder csv = new StringBuilder();
        csv.append("Nom,Email,Téléphone,Date d'inscription,Statut\n");

        for (Registration reg : registrations) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    reg.getParticipantName() != null ? reg.getParticipantName() : "",
                    reg.getParticipantEmail() != null ? reg.getParticipantEmail() : "",
                    reg.getParticipantPhone() != null ? reg.getParticipantPhone() : "",
                    reg.getRegistrationDate(),
                    reg.getStatus()));
        }

        byte[] csvBytes = csv.toString().getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment",
                "inscriptions-evenement-" + eventId + ".csv");

        return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/stats/{eventId}")
    public ResponseEntity<Map<String, Object>> getEventStats(@PathVariable Long eventId) {
        return ResponseEntity.ok(registrationService.getEventStats(eventId));
    }
}
