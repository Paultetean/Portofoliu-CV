package com.fitness.auth.exercise;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exercise_catalog")
public class ExerciseEntity {
  @Id
  private String exerciseId;

  @Column(nullable = false)
  private String name;

  private String gifUrl;

  @ElementCollection
  @CollectionTable(name = "exercise_body_parts", joinColumns = @JoinColumn(name = "exercise_id"))
  @OrderColumn(name = "item_index")
  @Column(name = "body_part")
  private List<String> bodyParts = new ArrayList<>();

  @ElementCollection
  @CollectionTable(name = "exercise_equipments", joinColumns = @JoinColumn(name = "exercise_id"))
  @OrderColumn(name = "item_index")
  @Column(name = "equipment")
  private List<String> equipments = new ArrayList<>();

  @ElementCollection
  @CollectionTable(name = "exercise_target_muscles", joinColumns = @JoinColumn(name = "exercise_id"))
  @OrderColumn(name = "item_index")
  @Column(name = "target_muscle")
  private List<String> targetMuscles = new ArrayList<>();

  @ElementCollection
  @CollectionTable(name = "exercise_secondary_muscles", joinColumns = @JoinColumn(name = "exercise_id"))
  @OrderColumn(name = "item_index")
  @Column(name = "secondary_muscle")
  private List<String> secondaryMuscles = new ArrayList<>();

  @ElementCollection
  @CollectionTable(name = "exercise_instructions", joinColumns = @JoinColumn(name = "exercise_id"))
  @OrderColumn(name = "item_index")
  @Column(name = "instruction", length = 1200)
  private List<String> instructions = new ArrayList<>();

  protected ExerciseEntity() {}

  public ExerciseEntity(Exercise exercise) {
    this.exerciseId = exercise.exerciseId();
    this.name = exercise.name();
    this.gifUrl = exercise.gifUrl();
    this.bodyParts = copyList(exercise.bodyParts());
    this.equipments = copyList(exercise.equipments());
    this.targetMuscles = copyList(exercise.targetMuscles());
    this.secondaryMuscles = copyList(exercise.secondaryMuscles());
    this.instructions = copyList(exercise.instructions());
  }

  public Exercise toResponse() {
    return new Exercise(
        exerciseId,
        name,
        gifUrl,
        new ArrayList<>(bodyParts),
        new ArrayList<>(equipments),
        new ArrayList<>(targetMuscles),
        new ArrayList<>(secondaryMuscles),
        new ArrayList<>(instructions));
  }

  private List<String> copyList(List<String> values) {
    return values == null ? new ArrayList<>() : new ArrayList<>(values);
  }
}
