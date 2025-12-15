package com.example.authservice.controller;

import com.example.authservice.dto.LoginRequest;
import com.example.authservice.dto.RegisterRequest;
import com.example.authservice.dto.AuthResponse;
import com.example.authservice.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest registerRequest) {
        System.out.println("📝 Inscription reçue - Username: " + registerRequest.getUsername() +
                " - Email: " + registerRequest.getEmail() +
                " - Role: " + registerRequest.getRole());

        try {
            AuthResponse response = authService.register(registerRequest);
            System.out.println("✅ Inscription réussie: " + response.getUsername() + " - Role: " + response.getRole());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println("❌ Erreur inscription: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponse(null, null, null, null, null, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("🔐 Connexion reçue - Username: " + loginRequest.getUsername());

        try {
            AuthResponse response = authService.login(loginRequest);
            System.out.println("✅ Connexion réussie: " + response.getUsername() + " - Role: " + response.getRole());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println("❌ Erreur connexion: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, null, null, null, null, e.getMessage()));
        }
    }
}
