package com.fitness.auth.security;

import com.fitness.auth.service.AuthException;
import com.fitness.auth.user.AppUser;
import com.fitness.auth.user.AppUserRepository;
import com.fitness.auth.user.UserRole;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
  private final JwtService jwtService;
  private final AppUserRepository userRepository;

  public CurrentUserService(JwtService jwtService, AppUserRepository userRepository) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
  }

  public AppUser requireUser(String authorizationHeader) {
    if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
      throw AuthException.unauthorized("Autentificare necesara.");
    }

    String token = authorizationHeader.substring("Bearer ".length());
    String username;

    try {
      username = jwtService.getUsernameFromToken(token);
    } catch (RuntimeException exception) {
      throw AuthException.unauthorized("Token invalid.");
    }

    AppUser user =
        userRepository
        .findByUsernameIgnoreCase(username)
        .orElseThrow(() -> AuthException.unauthorized("Utilizator inexistent."));

    if (!user.isActive()) {
      throw AuthException.unauthorized("Contul este dezactivat.");
    }

    return user;
  }

  public AppUser requireRole(String authorizationHeader, UserRole role) {
    AppUser user = requireUser(authorizationHeader);

    if (user.getRole() != role) {
      throw AuthException.forbidden("Nu ai permisiunea necesara.");
    }

    return user;
  }
}
