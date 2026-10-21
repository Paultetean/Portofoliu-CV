package com.fitness.auth.training;

import com.fitness.auth.user.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class TrainingDtos {
  private TrainingDtos() {}

  public record TrainerResponse(
      UUID id, String name, String role, String description, List<PlanResponse> plans) {}

  public record PlanResponse(UUID id, int sessions, int price, String focus) {}

  public record SelectPlanRequest(@NotNull UUID planId) {}

  public record ClientPlanResponse(
      UUID id,
      UUID planId,
      UUID trainerId,
      String trainerName,
      int sessions,
      int price,
      String focus,
      String trainerNotes,
      Instant selectedAt,
      Instant updatedAt) {}

  public record WorkoutLogRequest(
      @NotNull LocalDate date,
      @NotBlank String workoutType,
      @NotBlank String duration,
      @NotBlank String progress,
      @NotBlank String workoutPlan,
      String attachmentName) {}

  public record WorkoutLogResponse(
      UUID id,
      LocalDate date,
      String workoutType,
      String duration,
      String progress,
      String workoutPlan,
      String attachmentName,
      Instant createdAt) {}

  public record ChatMessageRequest(@NotBlank String text) {}

  public record ChatMessageResponse(
      UUID id,
      UUID senderId,
      String senderName,
      UserRole senderRole,
      String text,
      Instant createdAt) {}

  public record TrainerClientResponse(
      UUID clientId,
      String clientName,
      String clientEmail,
      UUID planId,
      int sessions,
      int price,
      String focus,
      String trainerNotes,
      Instant selectedAt,
      Instant updatedAt,
      List<WorkoutLogResponse> logs,
      List<AssignedExerciseResponse> assignedExercises,
      List<AppointmentResponse> appointments,
      List<ChatMessageResponse> messages,
      ClientProfileResponse clientProfile,
      NutritionTargetResponse nutritionTarget,
      List<NutritionLogResponse> nutritionLogs) {}

  public record UpdateClientPlanRequest(@NotBlank String focus, String trainerNotes) {}

  public record GenerateWorkoutRequest(LocalDate scheduledDate, String prompt) {}

  public record GeneratedExerciseResponse(
      String exerciseId,
      String exerciseName,
      String gifUrl,
      String dayName,
      LocalDate scheduledDate,
      List<String> muscleGroups,
      Integer setsCount,
      Integer minReps,
      Integer maxReps,
      Double suggestedWeight,
      String notes) {}

  public record GeneratedWorkoutResponse(
      String title, String rationale, List<GeneratedExerciseResponse> exercises) {}

  public record ClientProfileRequest(
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
      String restrictions) {}

  public record ClientProfileResponse(
      UUID id,
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
      String restrictions) {}

  public record NutritionTargetRequest(
      @NotNull @Positive Integer calories,
      @NotNull @Positive Integer protein,
      @NotNull @PositiveOrZero Integer carbs,
      @NotNull @Positive Integer fats,
      String notes) {}

  public record NutritionTargetResponse(
      UUID id,
      UUID clientId,
      String trainerName,
      Integer calories,
      Integer protein,
      Integer carbs,
      Integer fats,
      String notes,
      Instant updatedAt) {}

  public record NutritionLogRequest(
      @NotNull LocalDate date,
      @NotNull @PositiveOrZero Integer calories,
      @NotNull @PositiveOrZero Integer protein,
      @NotNull @PositiveOrZero Integer carbs,
      @NotNull @PositiveOrZero Integer fats,
      Double weight,
      String notes) {}

  public record NutritionLogResponse(
      UUID id,
      LocalDate date,
      Integer calories,
      Integer protein,
      Integer carbs,
      Integer fats,
      Double weight,
      String notes,
      Instant createdAt,
      Instant updatedAt) {}

  public record NutritionSuggestionResponse(
      Double bmi,
      Double bmr,
      Double tdee,
      Double activityFactor,
      String objective,
      Integer calories,
      Integer caloriesMin,
      Integer caloriesMax,
      Integer protein,
      Integer proteinMin,
      Integer proteinMax,
      Integer fats,
      Integer fatsMin,
      Integer fatsMax,
      Integer carbs,
      Double targetWeight,
      LocalDate targetDate,
      Double weightDelta,
      Double weeklyWeightChange,
      String targetPaceNote,
      String formulaNotes) {}

  public record AssignExerciseRequest(
      @NotBlank String exerciseId,
      @NotBlank String exerciseName,
      String gifUrl,
      String dayName,
      LocalDate scheduledDate,
      List<String> muscleGroups,
      @NotNull Integer setsCount,
      @NotNull Integer minReps,
      @NotNull Integer maxReps,
      Double suggestedWeight,
      String notes) {}

  public record SubmitExerciseResultsRequest(
      @NotNull List<Integer> repsPerSet, @NotNull List<Double> weightsPerSet) {}

  public record UpdateAssignedExerciseRequest(
      String dayName,
      LocalDate scheduledDate,
      List<String> muscleGroups,
      @NotNull Integer setsCount,
      @NotNull Integer minReps,
      @NotNull Integer maxReps,
      Double suggestedWeight,
      String notes) {}

  public record AssignedExerciseResponse(
      UUID id,
      String exerciseId,
      String exerciseName,
      String gifUrl,
      String dayName,
      LocalDate scheduledDate,
      List<String> muscleGroups,
      int setsCount,
      int minReps,
      int maxReps,
      Double suggestedWeight,
      String notes,
      List<Integer> repsPerSet,
      List<Double> weightsPerSet,
      Instant assignedAt,
      Instant updatedAt) {}

  public record AppointmentRequest(
      @NotNull UUID clientId,
      @NotNull LocalDateTime scheduledAt,
      @NotNull Integer durationMinutes,
      @NotBlank String title,
      String notes) {}

  public record ClientAppointmentRequest(
      @NotNull LocalDateTime scheduledAt,
      @NotNull Integer durationMinutes,
      String notes) {}

  public record TrainerAvailabilityRequest(
      @NotNull LocalDateTime scheduledAt,
      @NotNull Integer durationMinutes,
      String title,
      String notes) {}

  public record AppointmentResponse(
      UUID id,
      UUID clientId,
      String clientName,
      String trainerName,
      LocalDateTime scheduledAt,
      Integer durationMinutes,
      String title,
      String notes,
      String status,
      Instant createdAt) {}
}
