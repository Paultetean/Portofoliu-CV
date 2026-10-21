package com.fitness.auth.api;

import com.fitness.auth.user.UserRole;
import java.util.UUID;

public record AuthResponse(
    String token,
    String tokenType,
    long expiresInSeconds,
    UserResponse user) {
  public record UserResponse(
      UUID id, String fullName, String username, String email, UserRole role, boolean active) {}
}
