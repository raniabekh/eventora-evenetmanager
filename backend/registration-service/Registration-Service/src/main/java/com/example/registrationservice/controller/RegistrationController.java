package com.example.registrationservice.controller;

import com.example.registrationservice.dto.RegistrationRequest;
import com.example.registrationservice.model.Registration;
import com.example.registrationservice.service.RegistrationService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@CrossOrigin(origins = "http://localhost:4200")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    // ===== Participant: register =====
    @PostMapping("/events/{eventId}")
    public ResponseEntity<Registration> register(
            @PathVariable Long eventId,
            @RequestBody RegistrationRequest req,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role
    ) {
        if (!"PARTICIPANT".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (!req.acceptTerms) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(registrationService.registerToEvent(eventId, userId, req));
    }

    // ===== Participant: my registrations =====
    @GetMapping("/me")
    public ResponseEntity<List<Registration>> myRegistrations(
            @RequestHeader("X-User-Id") Long userId
    ) {
        return ResponseEntity.ok(registrationService.getUserRegistrations(userId));
    }

    // ===== Organizer: registrations of an event =====
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Registration>> getEventRegistrations(@PathVariable Long eventId) {
        return ResponseEntity.ok(registrationService.getEventRegistrations(eventId));
    }

    // ===== Cancel =====
    @DeleteMapping("/{registrationId}")
    public ResponseEntity<Void> cancel(
            @PathVariable Long registrationId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role
    ) {
        registrationService.cancelRegistration(registrationId, userId, role);
        return ResponseEntity.ok().build();
    }

    // ===== Export CSV =====
    @GetMapping("/event/{eventId}/export")
    public ResponseEntity<byte[]> export(@PathVariable Long eventId) {
        List<Registration> regs = registrationService.getEventRegistrations(eventId);

        StringBuilder csv = new StringBuilder();
        csv.append("Nom,Email,Téléphone,Date d'inscription,Statut\n");

        regs.forEach(r -> csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                r.getParticipantName(),
                r.getParticipantEmail(),
                r.getParticipantPhone() != null ? r.getParticipantPhone() : "",
                r.getRegistrationDate(),
                r.getStatus()
        )));

        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "inscriptions-evenement-" + eventId + ".csv");

        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }
}
