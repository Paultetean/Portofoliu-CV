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
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
    name = "daily_nutrition_logs",
    uniqueConstraints = @UniqueConstraint(columnNames = {"client_id", "log_date"}))
public class DailyNutritionLog {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "client_id", nullable = false)
  private AppUser client;

  @Column(name = "log_date", nullable = false)
  private LocalDate logDate;

  @Column(nullable = false)
  private Integer calories;

  @Column(nullable = false)
  private Integer protein;

  @Column(nullable = false)
  private Integer carbs;

  @Column(nullable = false)
  private Integer fats;

  private Double weight;

  @Column(length = 1200)
  private String notes;

  @Column(nullable = false)
  private Instant createdAt = Instant.now();

  @Column(nullable = false)
  private Instant updatedAt = Instant.now();

  protected DailyNutritionLog() {}

  public DailyNutritionLog(
      AppUser client,
      LocalDate logDate,
      Integer calories,
      Integer protein,
      Integer carbs,
      Integer fats,
      Double weight,
      String notes) {
    this.client = client;
    this.logDate = logDate;
    update(calories, protein, carbs, fats, weight, notes);
  }

  public UUID getId() {
    return id;
  }

  public AppUser getClient() {
    return client;
  }

  public LocalDate getLogDate() {
    return logDate;
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

  public Double getWeight() {
    return weight;
  }

  public String getNotes() {
    return notes;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void update(
      Integer calories,
      Integer protein,
      Integer carbs,
      Integer fats,
      Double weight,
      String notes) {
    this.calories = calories;
    this.protein = protein;
    this.carbs = carbs;
    this.fats = fats;
    this.weight = weight;
    this.notes = notes;
    this.updatedAt = Instant.now();
  }
}
