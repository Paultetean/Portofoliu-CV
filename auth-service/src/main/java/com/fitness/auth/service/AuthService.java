package com.fitness.auth.service;

import com.fitness.auth.api.AuthResponse;
import com.fitness.auth.api.ForgotPasswordRequest;
import com.fitness.auth.api.LoginRequest;
import com.fitness.auth.api.RegisterRequest;
import com.fitness.auth.security.JwtService;
import com.fitness.auth.user.AppUser;
import com.fitness.auth.user.AppUserRepository;
import com.fitness.auth.user.UserRole;
import java.security.SecureRandom;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private static final String TEMPORARY_PASSWORD_CHARACTERS =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  private static final int TEMPORARY_PASSWORD_LENGTH = 12;

  private final AppUserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final PasswordResetMailService passwordResetMailService;
  private final SecureRandom secureRandom = new SecureRandom();

  public AuthService(
      AppUserRepository userRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      PasswordResetMailService passwordResetMailService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.passwordResetMailService = passwordResetMailService;
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    String username = request.username().trim();
    String email = request.email().trim().toLowerCase();

    if (userRepository.existsByUsernameIgnoreCase(username)) {
      throw AuthException.badRequest("Username-ul este deja folosit.");
    }
    if (userRepository.existsByEmailIgnoreCase(email)) {
      throw AuthException.badRequest("Emailul este deja folosit.");
    }

    AppUser user =
        new AppUser(
            request.fullName().trim(),
            username,
            email,
            passwordEncoder.encode(request.password()),
            UserRole.CLIENT);

    return toAuthResponse(userRepository.save(user));
  }

  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest request) {
    AppUser user =
        userRepository
            .findByUsernameIgnoreCase(request.username().trim())
            .orElseThrow(() -> AuthException.unauthorized("Credentiale invalide."));

    if (!user.isActive()) {
      throw AuthException.unauthorized("Contul este dezactivat.");
    }

    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw AuthException.unauthorized("Credentiale invalide.");
    }

    return toAuthResponse(user);
  }

  @Transactional
  public void resetPassword(ForgotPasswordRequest request) {
    String email = request.email().trim().toLowerCase();
    AppUser user =
        userRepository
            .findByEmailIgnoreCase(email)
            .orElseThrow(() -> AuthException.notFound("Nu exista un cont cu acest email."));

    if (!user.isActive()) {
      throw AuthException.badRequest("Contul este dezactivat.");
    }

    String temporaryPassword = generateTemporaryPassword();
    passwordResetMailService.sendTemporaryPassword(user, temporaryPassword);
    user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
    userRepository.save(user);
  }

  private String generateTemporaryPassword() {
    StringBuilder password = new StringBuilder(TEMPORARY_PASSWORD_LENGTH);

    for (int index = 0; index < TEMPORARY_PASSWORD_LENGTH; index++) {
      int characterIndex = secureRandom.nextInt(TEMPORARY_PASSWORD_CHARACTERS.length());
      password.append(TEMPORARY_PASSWORD_CHARACTERS.charAt(characterIndex));
    }

    return password.toString();
  }

  private AuthResponse toAuthResponse(AppUser user) {
    return new AuthResponse(
        jwtService.generateToken(user),
        "Bearer",
        jwtService.getExpiresInSeconds(),
        new AuthResponse.UserResponse(
            user.getId(),
            user.getFullName(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.isActive()));
  }
}
