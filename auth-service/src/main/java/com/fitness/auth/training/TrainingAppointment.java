package com.fitness.auth.training;

import com.fitness.auth.user.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "training_appointments")
public class TrainingAppointment {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "client_id", nullable = false)
  private AppUser client;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "trainer_profile_id", nullable = false)
  private TrainerProfile trainerProfile;

  @Column(nullable = false)
  private LocalDateTime scheduledAt;

  @Column(nullable = false)
  private Integer durationMinutes;

  @Column(nullable = false)
  private String title;

  @Column(length = 1200)
  private String notes;

  @Column(nullable = false)
  private String status = "PROGRAMAT";

  @Column(nullable = false)
  private Instant createdAt = Instant.now();

  protected TrainingAppointment() {}

  public TrainingAppointment(
      AppUser client,
      TrainerProfile trainerProfile,
      LocalDateTime scheduledAt,
      Integer durationMinutes,
      String title,
      String notes) {
    this.client = client;
    this.trainerProfile = trainerProfile;
    this.scheduledAt = scheduledAt;
    this.durationMinutes = durationMinutes;
    this.title = title;
    this.notes = notes;
  }

  public UUID getId() {
    return id;
  }

  public AppUser getClient() {
    return client;
  }

  public TrainerProfile getTrainerProfile() {
    return trainerProfile;
  }

  public LocalDateTime getScheduledAt() {
    return scheduledAt;
  }

  public Integer getDurationMinutes() {
    return durationMinutes;
  }

  public String getTitle() {
    return title;
  }

  public String getNotes() {
    return notes;
  }

  public String getStatus() {
    return status;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
