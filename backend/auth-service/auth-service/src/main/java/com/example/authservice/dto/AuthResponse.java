package com.example.authservice.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private String userId;
    private String role;
    private String message;

    // Constructeur par défaut (OBLIGATOIRE)
    public AuthResponse() {
    }

    // Constructeur complet
    public AuthResponse(String token, String username, String email, String userId, String role, String message) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.userId = userId;
        this.role = role;
        this.message = message;
    }

    // Getters et Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}