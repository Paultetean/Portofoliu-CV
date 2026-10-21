package com.fitness.auth.training;

import com.fitness.auth.user.AppUser;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "client_profiles")
public class ClientProfile {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "client_id", nullable = false, unique = true)
  private AppUser client;

  private Integer age;
  private Integer height;
  private Double weight;
  private Double targetWeight;
  private LocalDate targetDate;
  private String sex;
  private String lifestyle;
  private String experienceLevel;
  private String goal;
  private Integer daysPerWeek;
  private Integer maxSessionDuration;
  private String restrictions;

  protected ClientProfile() {}

  public ClientProfile(AppUser client) {
    this.client = client;
  }

  public UUID getId() {
    return id;
  }

  public AppUser getClient() {
    return client;
  }

  public Integer getAge() {
    return age;
  }

  public Integer getHeight() {
    return height;
  }

  public Double getWeight() {
    return weight;
  }

  public Double getTargetWeight() {
    return targetWeight;
  }

  public LocalDate getTargetDate() {
    return targetDate;
  }

  public String getSex() {
    return sex;
  }

  public String getLifestyle() {
    return lifestyle;
  }

  public String getExperienceLevel() {
    return experienceLevel;
  }

  public String getGoal() {
    return goal;
  }

  public Integer getDaysPerWeek() {
    return daysPerWeek;
  }

  public Integer getMaxSessionDuration() {
    return maxSessionDuration;
  }

  public String getRestrictions() {
    return restrictions;
  }

  public void update(
      Integer age,
      Integer height,
      Double weight,
      Double targetWeight,
      LocalDate targetDate,
      String sex,
      String lifestyle,
      String experienceLevel,
      String goal,
      Integer daysPerWeek,
      Integer maxSessionDuration,
      String restrictions) {
    this.age = age;
    this.height = height;
    this.weight = weight;
    this.targetWeight = targetWeight;
    this.targetDate = targetDate;
    this.sex = sex;
    this.lifestyle = lifestyle;
    this.experienceLevel = experienceLevel;
    this.goal = goal;
    this.daysPerWeek = daysPerWeek;
    this.maxSessionDuration = maxSessionDuration;
    this.restrictions = restrictions;
  }
}
