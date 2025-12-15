package com.example.authservice.service;

import com.example.authservice.dto.LoginRequest;
import com.example.authservice.dto.RegisterRequest;
import com.example.authservice.dto.AuthResponse;
import com.example.authservice.model.User;
import com.example.authservice.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest registerRequest) {
        // Vérifier si username existe
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Username déjà utilisé");
        }

        // Vérifier si email existe
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }

        // Créer l'utilisateur
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        // Définir le rôle
        String role = registerRequest.getRole();
        if (role == null || role.isEmpty()) {
            role = "PARTICIPANT";
        }
        user.setRolesString("ROLE_" + role.toUpperCase());

        // Sauvegarder
        User savedUser = userRepository.save(user);

        // Retourner la réponse
        return new AuthResponse(
                "token-simple-pour-" + savedUser.getUsername(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getId().toString(),
                role.toUpperCase(),
                "Inscription réussie"
        );
    }

    public AuthResponse login(LoginRequest loginRequest) {
        // Trouver l'utilisateur
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifier le mot de passe
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        // Extraire le rôle
        String roleString = user.getRolesString();
        String role = "PARTICIPANT";

        if (roleString != null && roleString.startsWith("ROLE_")) {
            role = roleString.substring(5);
        }

        // Retourner la réponse
        return new AuthResponse(
                "token-simple-pour-" + user.getUsername(),
                user.getUsername(),
                user.getEmail(),
                user.getId().toString(),
                role,
                "Connexion réussie"
        );
    }
}
