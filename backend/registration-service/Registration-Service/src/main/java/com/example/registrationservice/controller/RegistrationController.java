// RegistrationController.java - AJOUTER
@GetMapping("/event/{eventId}")
public ResponseEntity<List<Registration>> getEventRegistrations(
        @PathVariable Long eventId,
        @RequestHeader("X-User-Id") Long userId,
        @RequestHeader("X-User-Role") String userRole) {

    // Vérifier que l'utilisateur est l'organisateur de l'événement
    // (Vous aurez besoin d'une méthode pour vérifier cela)

    List<Registration> registrations = registrationService.getEventRegistrations(eventId);
    return ResponseEntity.ok(registrations);
}

@GetMapping("/event/{eventId}/export")
public ResponseEntity<byte[]> exportEventRegistrations(@PathVariable Long eventId) {
    List<Registration> registrations = registrationService.getEventRegistrations(eventId);

    // Créer un CSV
    StringBuilder csv = new StringBuilder();
    csv.append("Nom,Email,Téléphone,Date d'inscription,Statut\n");

    for (Registration reg : registrations) {
        csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                reg.getParticipantName(),
                reg.getParticipantEmail(),
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