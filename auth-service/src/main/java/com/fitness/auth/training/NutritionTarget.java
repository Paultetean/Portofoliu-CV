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
@Table(name = "nutrition_targets")
public class NutritionTarget {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "client_id", nullable = false, unique = true)
  private AppUser client;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "trainer_profile_id", nullable = false)
  private TrainerProfile trainerProfile;

  @Column(nullable = false)
  private Integer calories;

  @Column(nullable = false)
  private Integer protein;

  @Column(nullable = false)
  private Integer carbs;

  @Column(nullable = false)
  private Integer fats;

  @Column(length = 1200)
  private String notes;

  @Column(nullable = false)
  private Instant updatedAt = Instant.now();

  protected NutritionTarget() {}

  public NutritionTarget(
      AppUser client,
      TrainerProfile trainerProfile,
      Integer calories,
      Integer protein,
      Integer carbs,
      Integer fats,
      String notes) {
    this.client = client;
    this.trainerProfile = trainerProfile;
    update(trainerProfile, calories, protein, carbs, fats, notes);
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

  public Integer getCalories() {
    return calories;
  }

  public Integer getProtein() {
    return protein;
  }

  public Integer getCarbs() {
    return carbs;
  }

  public Integer getFats() {
    return fats;
  }

  public String getNotes() {
    return notes;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void update(
      TrainerProfile trainerProfile,
      Integer calories,
      Integer protein,
      Integer carbs,
      Integer fats,
      String notes) {
    this.trainerProfile = trainerProfile;
    this.calories = calories;
    this.protein = protein;
    this.carbs = carbs;
    this.fats = fats;
    this.notes = notes;
    this.updatedAt = Instant.now();
  }
}
