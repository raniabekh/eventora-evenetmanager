package com.example.authservice.dto;

public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String role;   // <-- AJOUT OBLIGATOIRE

    public RegisterRequest() {
    }

    public RegisterRequest(String username, String email, String password, String role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {       // <-- AJOUT
        return role;
    }

    public void setRole(String role) {   // <-- AJOUT
        this.role = role;
    }
}
