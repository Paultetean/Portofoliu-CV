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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "client_plans")
public class ClientPlan {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "client_id", nullable = false, unique = true)
  private AppUser client;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "training_plan_id", nullable = false)
  private TrainingPlan trainingPlan;

  @Column(nullable = false)
  private String activeFocus;

  @Column(length = 1600)
  private String trainerNotes;

  @Column(nullable = false)
  private Instant selectedAt = Instant.now();

  @Column(nullable = false)
  private Instant updatedAt = Instant.now();

  protected ClientPlan() {}

  public ClientPlan(AppUser client, TrainingPlan trainingPlan) {
    this.client = client;
    this.trainingPlan = trainingPlan;
    this.activeFocus = trainingPlan.getFocus();
  }

  public UUID getId() {
    return id;
  }

  public AppUser getClient() {
    return client;
  }

  public TrainingPlan getTrainingPlan() {
    return trainingPlan;
  }

  public String getActiveFocus() {
    return activeFocus;
  }

  public String getTrainerNotes() {
    return trainerNotes;
  }

  public Instant getSelectedAt() {
    return selectedAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void updateTraining(String activeFocus, String trainerNotes) {
    this.activeFocus = activeFocus;
    this.trainerNotes = trainerNotes;
    this.updatedAt = Instant.now();
  }

  public void renew() {
    Instant now = Instant.now();
    this.selectedAt = now;
    this.updatedAt = now;
  }
}
