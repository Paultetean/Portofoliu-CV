package com.fitness.auth.training;

import com.fitness.auth.user.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "trainer_profiles")
public class TrainerProfile {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private AppUser user;

  @Column(nullable = false)
  private String displayName;

  @Column(nullable = false)
  private String roleTitle;

  @Column(nullable = false, length = 1000)
  private String description;

  protected TrainerProfile() {}

  public TrainerProfile(AppUser user, String displayName, String roleTitle, String description) {
    this.user = user;
    this.displayName = displayName;
    this.roleTitle = roleTitle;
    this.description = description;
  }

  public UUID getId() {
    return id;
  }

  public AppUser getUser() {
    return user;
  }

  public String getDisplayName() {
    return displayName;
  }

  public String getRoleTitle() {
    return roleTitle;
  }

  public String getDescription() {
    return description;
  }
}
