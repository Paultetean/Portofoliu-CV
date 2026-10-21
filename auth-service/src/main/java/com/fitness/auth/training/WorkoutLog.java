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
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "workout_logs")
public class WorkoutLog {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "client_id", nullable = false)
  private AppUser client;

  @Column(nullable = false)
  private LocalDate workoutDate;

  @Column(nullable = false)
  private String workoutType;

  @Column(nullable = false)
  private String duration;

  @Column(nullable = false, length = 1600)
  private String progress;

  @Column(nullable = false, length = 2400)
  private String workoutPlan;

  private String attachmentName;

  @Column(nullable = false)
  private Instant createdAt = Instant.now();

  protected WorkoutLog() {}

  public WorkoutLog(
      AppUser client,
      LocalDate workoutDate,
      String workoutType,
      String duration,
      String progress,
      String workoutPlan,
      String attachmentName) {
    this.client = client;
    this.workoutDate = workoutDate;
    this.workoutType = workoutType;
    this.duration = duration;
    this.progress = progress;
    this.workoutPlan = workoutPlan;
    this.attachmentName = attachmentName;
  }

  public UUID getId() {
    return id;
  }

  public AppUser getClient() {
    return client;
  }

  public LocalDate getWorkoutDate() {
    return workoutDate;
  }

  public String getWorkoutType() {
    return workoutType;
  }

  public String getDuration() {
    return duration;
  }

  public String getProgress() {
    return progress;
  }

  public String getWorkoutPlan() {
    return workoutPlan;
  }

  public String getAttachmentName() {
    return attachmentName;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
