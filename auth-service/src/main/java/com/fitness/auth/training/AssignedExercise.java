package com.fitness.auth.training;

import com.fitness.auth.user.AppUser;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "assigned_exercises")
public class AssignedExercise {
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
  private String exerciseId;

  @Column(nullable = false)
  private String exerciseName;

  private String gifUrl;

  @Column(nullable = false, columnDefinition = "varchar(255) default 'Ziua de antrenament'")
  private String dayName = "Ziua de antrenament";

  @Column
  private LocalDate scheduledDate = LocalDate.now();

  @ElementCollection
  @CollectionTable(name = "assigned_exercise_muscle_groups", joinColumns = @JoinColumn(name = "assignment_id"))
  @OrderColumn(name = "item_index")
  @Column(name = "muscle_group")
  private List<String> muscleGroups = new ArrayList<>();

  @Column(nullable = false)
  private int setsCount;

  @Column(nullable = false)
  private int minReps;

  @Column(nullable = false)
  private int maxReps;

  @Column(length = 1000)
  private String notes;

  private Double suggestedWeight;

  @ElementCollection
  @CollectionTable(name = "assigned_exercise_results", joinColumns = @JoinColumn(name = "assignment_id"))
  @OrderColumn(name = "set_index")
  @Column(name = "reps")
  private List<Integer> repsPerSet = new ArrayList<>();

  @ElementCollection
  @CollectionTable(name = "assigned_exercise_weights", joinColumns = @JoinColumn(name = "assignment_id"))
  @OrderColumn(name = "set_index")
  @Column(name = "weight")
  private List<Double> weightsPerSet = new ArrayList<>();

  @Column(nullable = false)
  private Instant assignedAt = Instant.now();

  @Column(nullable = false)
  private Instant updatedAt = Instant.now();

  protected AssignedExercise() {}

  public AssignedExercise(
      AppUser client,
      TrainerProfile trainerProfile,
      String exerciseId,
      String exerciseName,
      String gifUrl,
      String dayName,
      LocalDate scheduledDate,
      List<String> muscleGroups,
      int setsCount,
      int minReps,
      int maxReps,
      String notes,
      Double suggestedWeight) {
    this.client = client;
    this.trainerProfile = trainerProfile;
    this.exerciseId = exerciseId;
    this.exerciseName = exerciseName;
    this.gifUrl = gifUrl;
    this.dayName = dayName;
    this.scheduledDate = scheduledDate == null ? LocalDate.now() : scheduledDate;
    this.muscleGroups = new ArrayList<>(muscleGroups);
    this.setsCount = setsCount;
    this.minReps = minReps;
    this.maxReps = maxReps;
    this.notes = notes;
    this.suggestedWeight = suggestedWeight;
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

  public String getExerciseId() {
    return exerciseId;
  }

  public String getExerciseName() {
    return exerciseName;
  }

  public String getGifUrl() {
    return gifUrl;
  }

  public String getDayName() {
    return dayName;
  }

  public LocalDate getScheduledDate() {
    return scheduledDate;
  }

  public List<String> getMuscleGroups() {
    return muscleGroups;
  }

  public int getSetsCount() {
    return setsCount;
  }

  public int getMinReps() {
    return minReps;
  }

  public int getMaxReps() {
    return maxReps;
  }

  public String getNotes() {
    return notes;
  }

  public Double getSuggestedWeight() {
    return suggestedWeight;
  }

  public List<Integer> getRepsPerSet() {
    return repsPerSet;
  }

  public List<Double> getWeightsPerSet() {
    return weightsPerSet;
  }

  public Instant getAssignedAt() {
    return assignedAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void submitResults(List<Integer> repsPerSet, List<Double> weightsPerSet) {
    this.repsPerSet = new ArrayList<>(repsPerSet);
    this.weightsPerSet = new ArrayList<>(weightsPerSet);
    this.updatedAt = Instant.now();
  }

  public void updatePrescription(
      String dayName,
      LocalDate scheduledDate,
      List<String> muscleGroups,
      int setsCount,
      int minReps,
      int maxReps,
      String notes,
      Double suggestedWeight) {
    this.dayName = dayName;
    this.scheduledDate = scheduledDate == null ? this.scheduledDate : scheduledDate;
    this.muscleGroups = new ArrayList<>(muscleGroups);
    this.setsCount = setsCount;
    this.minReps = minReps;
    this.maxReps = maxReps;
    this.notes = notes;
    this.suggestedWeight = suggestedWeight;

    if (repsPerSet.size() > setsCount) {
      this.repsPerSet = new ArrayList<>(repsPerSet.subList(0, setsCount));
    }
    if (weightsPerSet.size() > setsCount) {
      this.weightsPerSet = new ArrayList<>(weightsPerSet.subList(0, setsCount));
    }

    this.updatedAt = Instant.now();
  }
}
