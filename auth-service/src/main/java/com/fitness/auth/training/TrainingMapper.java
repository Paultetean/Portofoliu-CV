package com.fitness.auth.training;

import com.fitness.auth.training.TrainingDtos.ChatMessageResponse;
import com.fitness.auth.training.TrainingDtos.AssignedExerciseResponse;
import com.fitness.auth.training.TrainingDtos.AppointmentResponse;
import com.fitness.auth.training.TrainingDtos.ClientPlanResponse;
import com.fitness.auth.training.TrainingDtos.NutritionLogResponse;
import com.fitness.auth.training.TrainingDtos.NutritionTargetResponse;
import com.fitness.auth.training.TrainingDtos.PlanResponse;
import com.fitness.auth.training.TrainingDtos.TrainerResponse;
import com.fitness.auth.training.TrainingDtos.WorkoutLogResponse;
import java.util.ArrayList;
import java.util.List;

class TrainingMapper {
  TrainerResponse toTrainerResponse(TrainerProfile trainerProfile, List<TrainingPlan> plans) {
    return new TrainerResponse(
        trainerProfile.getId(),
        trainerProfile.getDisplayName(),
        trainerProfile.getRoleTitle(),
        trainerProfile.getDescription(),
        plans.stream().map(this::toPlanResponse).toList());
  }

  PlanResponse toPlanResponse(TrainingPlan plan) {
    return new PlanResponse(plan.getId(), plan.getSessions(), plan.getPrice(), plan.getFocus());
  }

  ClientPlanResponse toClientPlanResponse(ClientPlan clientPlan) {
    TrainingPlan plan = clientPlan.getTrainingPlan();
    TrainerProfile trainer = plan.getTrainerProfile();

    return new ClientPlanResponse(
        clientPlan.getId(),
        plan.getId(),
        trainer.getId(),
        trainer.getDisplayName(),
        plan.getSessions(),
        plan.getPrice(),
        clientPlan.getActiveFocus(),
        clientPlan.getTrainerNotes(),
        clientPlan.getSelectedAt(),
        clientPlan.getUpdatedAt());
  }

  WorkoutLogResponse toWorkoutLogResponse(WorkoutLog log) {
    return new WorkoutLogResponse(
        log.getId(),
        log.getWorkoutDate(),
        log.getWorkoutType(),
        log.getDuration(),
        log.getProgress(),
        log.getWorkoutPlan(),
        log.getAttachmentName(),
        log.getCreatedAt());
  }

  NutritionTargetResponse toNutritionTargetResponse(NutritionTarget target) {
    return new NutritionTargetResponse(
        target.getId(),
        target.getClient().getId(),
        target.getTrainerProfile().getDisplayName(),
        target.getCalories(),
        target.getProtein(),
        target.getCarbs(),
        target.getFats(),
        target.getNotes(),
        target.getUpdatedAt());
  }

  NutritionLogResponse toNutritionLogResponse(DailyNutritionLog log) {
    return new NutritionLogResponse(
        log.getId(),
        log.getLogDate(),
        log.getCalories(),
        log.getProtein(),
        log.getCarbs(),
        log.getFats(),
        log.getWeight(),
        log.getNotes(),
        log.getCreatedAt(),
        log.getUpdatedAt());
  }

  ChatMessageResponse toChatMessageResponse(ChatMessage message) {
    return new ChatMessageResponse(
        message.getId(),
        message.getSender().getId(),
        message.getSender().getFullName(),
        message.getSenderRole(),
        message.getText(),
        message.getCreatedAt());
  }

  AssignedExerciseResponse toAssignedExerciseResponse(AssignedExercise exercise) {
    return new AssignedExerciseResponse(
        exercise.getId(),
        exercise.getExerciseId(),
        exercise.getExerciseName(),
        exercise.getGifUrl(),
        exercise.getDayName(),
        exercise.getScheduledDate(),
        new ArrayList<>(exercise.getMuscleGroups()),
        exercise.getSetsCount(),
        exercise.getMinReps(),
        exercise.getMaxReps(),
        exercise.getSuggestedWeight(),
        exercise.getNotes(),
        new ArrayList<>(exercise.getRepsPerSet()),
        new ArrayList<>(exercise.getWeightsPerSet()),
        exercise.getAssignedAt(),
        exercise.getUpdatedAt());
  }

  AppointmentResponse toAppointmentResponse(TrainingAppointment appointment) {
    return new AppointmentResponse(
        appointment.getId(),
        appointment.getClient().getId(),
        appointment.getClient().getFullName(),
        appointment.getTrainerProfile().getDisplayName(),
        appointment.getScheduledAt(),
        appointment.getDurationMinutes(),
        appointment.getTitle(),
        appointment.getNotes(),
        appointment.getStatus(),
        appointment.getCreatedAt());
  }

  AppointmentResponse toAppointmentResponse(TrainerAvailabilitySlot slot) {
    return new AppointmentResponse(
        slot.getId(),
        slot.getClient() == null ? null : slot.getClient().getId(),
        slot.getClient() == null ? null : slot.getClient().getFullName(),
        slot.getTrainerProfile().getDisplayName(),
        slot.getScheduledAt(),
        slot.getDurationMinutes(),
        slot.getTitle(),
        slot.getNotes(),
        slot.getStatus(),
        slot.getCreatedAt());
  }
}
