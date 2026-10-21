package com.fitness.auth.admin;

import com.fitness.auth.user.AppUser;
import com.fitness.auth.user.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "admin_audit_logs")
public class AdminAuditLog {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false)
  private UUID actorId;

  @Column(nullable = false)
  private String actorName;

  @Column(nullable = false)
  private String actorUsername;

  private UUID targetId;

  private String targetName;

  private String targetUsername;

  @Enumerated(EnumType.STRING)
  private UserRole targetRole;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private AdminAuditAction action;

  @Column(nullable = false, length = 1200)
  private String details;

  @Column(nullable = false)
  private Instant createdAt = Instant.now();

  protected AdminAuditLog() {}

  public AdminAuditLog(
      AppUser actor, AppUser target, AdminAuditAction action, String details) {
    this.actorId = actor.getId();
    this.actorName = actor.getFullName();
    this.actorUsername = actor.getUsername();
    this.targetId = target.getId();
    this.targetName = target.getFullName();
    this.targetUsername = target.getUsername();
    this.targetRole = target.getRole();
    this.action = action;
    this.details = details;
  }

  public UUID getId() {
    return id;
  }

  public UUID getActorId() {
    return actorId;
  }

  public String getActorName() {
    return actorName;
  }

  public String getActorUsername() {
    return actorUsername;
  }

  public UUID getTargetId() {
    return targetId;
  }

  public String getTargetName() {
    return targetName;
  }

  public String getTargetUsername() {
    return targetUsername;
  }

  public UserRole getTargetRole() {
    return targetRole;
  }

  public AdminAuditAction getAction() {
    return action;
  }

  public String getDetails() {
    return details;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
