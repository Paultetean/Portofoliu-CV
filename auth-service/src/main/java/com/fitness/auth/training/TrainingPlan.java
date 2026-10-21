package com.fitness.auth.training;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "training_plans")
public class TrainingPlan {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "trainer_profile_id", nullable = false)
  private TrainerProfile trainerProfile;

  @Column(nullable = false)
  private int sessions;

  @Column(nullable = false)
  private int price;

  @Column(nullable = false)
  private String focus;

  protected TrainingPlan() {}

  public TrainingPlan(TrainerProfile trainerProfile, int sessions, int price, String focus) {
    this.trainerProfile = trainerProfile;
    this.sessions = sessions;
    this.price = price;
    this.focus = focus;
  }

  public UUID getId() {
    return id;
  }

  public TrainerProfile getTrainerProfile() {
    return trainerProfile;
  }

  public int getSessions() {
    return sessions;
  }

  public int getPrice() {
    return price;
  }

  public String getFocus() {
    return focus;
  }
}
