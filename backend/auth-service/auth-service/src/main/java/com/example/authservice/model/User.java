package com.example.authservice.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    // CHANGEMENT ICI : Stocke les rôles comme une simple String
    // Ou utilisez un tableau si vous voulez plusieurs rôles
    @Column(name = "roles", length = 1000)
    private String roles = "ROLE_PARTICIPANT";

    // Constructeurs
    public User() {}

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.roles = "ROLE_PARTICIPANT";
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    // Pour la compatibilité avec l'ancien code
    public Set<String> getRoles() {
        Set<String> rolesSet = new HashSet<>();
        if (this.roles != null) {
            rolesSet.add(this.roles);
        }
        return rolesSet;
    }

    public void setRoles(Set<String> roles) {
        if (roles != null && !roles.isEmpty()) {
            this.roles = String.join(",", roles);
        }
    }

    // Getter/Setter direct pour le champ String
    public String getRolesString() {
        return roles;
    }

    public void setRolesString(String roles) {
        this.roles = roles;
    }
}