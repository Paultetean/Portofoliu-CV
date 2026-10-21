package com.fitness.auth.training;

import com.fitness.auth.security.CurrentUserService;
import com.fitness.auth.training.TrainingDtos.ChatMessageRequest;
import com.fitness.auth.training.TrainingDtos.ChatMessageResponse;
import com.fitness.auth.training.TrainingDtos.AssignExerciseRequest;
import com.fitness.auth.training.TrainingDtos.AssignedExerciseResponse;
import com.fitness.auth.training.TrainingDtos.AppointmentRequest;
import com.fitness.auth.training.TrainingDtos.AppointmentResponse;
import com.fitness.auth.training.TrainingDtos.ClientAppointmentRequest;
import com.fitness.auth.training.TrainingDtos.ClientProfileRequest;
import com.fitness.auth.training.TrainingDtos.ClientProfileResponse;
import com.fitness.auth.training.TrainingDtos.GeneratedWorkoutResponse;
import com.fitness.auth.training.TrainingDtos.GenerateWorkoutRequest;
import com.fitness.auth.training.TrainingDtos.ClientPlanResponse;
import com.fitness.auth.training.TrainingDtos.NutritionLogRequest;
import com.fitness.auth.training.TrainingDtos.NutritionLogResponse;
import com.fitness.auth.training.TrainingDtos.NutritionSuggestionResponse;
import com.fitness.auth.training.TrainingDtos.NutritionTargetRequest;
import com.fitness.auth.training.TrainingDtos.NutritionTargetResponse;
import com.fitness.auth.training.TrainingDtos.SelectPlanRequest;
import com.fitness.auth.training.TrainingDtos.SubmitExerciseResultsRequest;
import com.fitness.auth.training.TrainingDtos.TrainerAvailabilityRequest;
import com.fitness.auth.training.TrainingDtos.TrainerClientResponse;
import com.fitness.auth.training.TrainingDtos.TrainerResponse;
import com.fitness.auth.training.TrainingDtos.UpdateAssignedExerciseRequest;
import com.fitness.auth.training.TrainingDtos.UpdateClientPlanRequest;
import com.fitness.auth.training.TrainingDtos.WorkoutLogRequest;
import com.fitness.auth.training.TrainingDtos.WorkoutLogResponse;
import com.fitness.auth.user.AppUser;
import com.fitness.auth.user.UserRole;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TrainingController {
  private final TrainingService trainingService;
  private final CurrentUserService currentUserService;

  public TrainingController(TrainingService trainingService, CurrentUserService currentUserService) {
    this.trainingService = trainingService;
    this.currentUserService = currentUserService;
  }

  @GetMapping("/trainers")
  public List<TrainerResponse> getTrainers() {
    return trainingService.getTrainers();
  }

  @GetMapping("/client/plan")
  public ClientPlanResponse getClientPlan(@RequestHeader("Authorization") String authorization) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.getClientPlan(client);
  }

  @GetMapping("/client/profile")
  public ClientProfileResponse getClientProfile(
      @RequestHeader("Authorization") String authorization) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.getClientProfile(client);
  }

  @PatchMapping("/client/profile")
  public ClientProfileResponse updateClientProfile(
      @RequestHeader("Authorization") String authorization,
      @Valid @RequestBody ClientProfileRequest request) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.updateClientProfile(client, request);
  }

  @PostMapping("/client/plan")
  @ResponseStatus(HttpStatus.CREATED)
  public ClientPlanResponse selectPlan(
      @RequestHeader("Authorization") String authorization,
      @Valid @RequestBody SelectPlanRequest request) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.selectPlan(client, request);
  }

  @PostMapping("/client/plan/renew")
  public ClientPlanResponse renewClientPlan(@RequestHeader("Authorization") String authorization) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.renewClientPlan(client);
  }

  @GetMapping("/client/workout-logs")
  public List<WorkoutLogResponse> getWorkoutLogs(
      @RequestHeader("Authorization") String authorization) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.getWorkoutLogs(client);
  }

  @GetMapping("/client/assigned-exercises")
  public List<AssignedExerciseResponse> getAssignedExercises(
      @RequestHeader("Authorization") String authorization) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.getAssignedExercises(client);
  }

  @PatchMapping("/client/assigned-exercises/{assignmentId}/results")
  public AssignedExerciseResponse submitAssignedExerciseResults(
      @RequestHeader("Authorization") String authorization,
      @PathVariable UUID assignmentId,
      @Valid @RequestBody SubmitExerciseResultsRequest request) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.submitAssignedExerciseResults(client, assignmentId, request);
  }

  @PostMapping("/client/workout-logs")
  @ResponseStatus(HttpStatus.CREATED)
  public WorkoutLogResponse createWorkoutLog(
      @RequestHeader("Authorization") String authorization,
      @Valid @RequestBody WorkoutLogRequest request) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.createWorkoutLog(client, request);
  }

  @GetMapping("/client/nutrition-target")
  public NutritionTargetResponse getClientNutritionTarget(
      @RequestHeader("Authorization") String authorization) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.getClientNutritionTarget(client);
  }

  @GetMapping("/client/nutrition-logs")
  public List<NutritionLogResponse> getClientNutritionLogs(
      @RequestHeader("Authorization") String authorization) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.getClientNutritionLogs(client);
  }

  @PostMapping("/client/nutrition-logs")
  @ResponseStatus(HttpStatus.CREATED)
  public NutritionLogResponse upsertClientNutritionLog(
      @RequestHeader("Authorization") String authorization,
      @Valid @RequestBody NutritionLogRequest request) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.upsertClientNutritionLog(client, request);
  }

  @GetMapping("/client/chat")
  public List<ChatMessageResponse> getClientChat(
      @RequestHeader("Authorization") String authorization) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.getClientChat(client);
  }

  @GetMapping("/client/appointments")
  public List<AppointmentResponse> getClientAppointments(
      @RequestHeader("Authorization") String authorization) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.getClientAppointments(client);
  }

  @GetMapping("/client/availability")
  public List<AppointmentResponse> getClientAvailability(
      @RequestHeader("Authorization") String authorization) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.getAvailableSlotsForClient(client);
  }

  @PostMapping("/client/availability/{slotId}/book")
  public AppointmentResponse bookClientAvailability(
      @RequestHeader("Authorization") String authorization, @PathVariable UUID slotId) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.bookAvailableSlot(client, slotId);
  }

  @PostMapping("/client/appointments")
  @ResponseStatus(HttpStatus.CREATED)
  public AppointmentResponse requestClientAppointment(
      @RequestHeader("Authorization") String authorization,
      @Valid @RequestBody ClientAppointmentRequest request) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.requestClientAppointment(client, request);
  }

  @PostMapping("/client/chat")
  @ResponseStatus(HttpStatus.CREATED)
  public ChatMessageResponse sendClientMessage(
      @RequestHeader("Authorization") String authorization,
      @Valid @RequestBody ChatMessageRequest request) {
    AppUser client = currentUserService.requireRole(authorization, UserRole.CLIENT);
    return trainingService.sendClientMessage(client, request);
  }

  @GetMapping("/trainer/clients")
  public List<TrainerClientResponse> getTrainerClients(
      @RequestHeader("Authorization") String authorization) {
    AppUser trainer = currentUserService.requireRole(authorization, UserRole.TRAINER);
    return trainingService.getTrainerClients(trainer);
  }

  @GetMapping("/trainer/appointments")
  public List<AppointmentResponse> getTrainerAppointments(
      @RequestHeader("Authorization") String authorization) {
    AppUser trainer = currentUserService.requireRole(authorization, UserRole.TRAINER);
    return trainingService.getTrainerAppointments(trainer);
  }

  @GetMapping("/trainer/availability")
  public List<AppointmentResponse> getTrainerAvailability(
      @RequestHeader("Authorization") String authorization) {
    AppUser trainer = currentUserService.requireRole(authorization, UserRole.TRAINER);
    return trainingService.getTrainerAvailability(trainer);
  }

  @PostMapping("/trainer/availability")
  @ResponseStatus(HttpStatus.CREATED)
  public List<AppointmentResponse> createTrainerAvailability(
      @RequestHeader("Authorization") String authorization,
      @Valid @RequestBody TrainerAvailabilityRequest request) {
    AppUser trainer = currentUserService.requireRole(authorization, UserRole.TRAINER);
    return trainingService.createTrainerAvailability(trainer, request);
  }

  @PostMapping("/trainer/appointments")
  @ResponseStatus(HttpStatus.CREATED)
  public AppointmentResponse createTrainerAppointment(
      @RequestHeader("Authorization") String authorization,
      @Valid @RequestBody AppointmentRequest request) {
    AppUser trainer = currentUserService.requireRole(authorization, UserRole.TRAINER);
    return trainingService.createTrainerAppointment(trainer, request);
  }

  @PatchMapping("/trainer/clients/{clientId}/plan")
  public TrainerClientResponse updateClientPlan(
      @RequestHeader("Authorization") String authorization,
      @PathVariable UUID clientId,
      @Valid @RequestBody UpdateClientPlanRequest request) {
    AppUser trainer = currentUserService.requireRole(authorization, UserRole.TRAINER);
    return trainingService.updateClientPlan(trainer, clientId, request);
  }

  @PostMapping("/trainer/clients/{clientId}/chat")
  @ResponseStatus(HttpStatus.CREATED)
  public ChatMessageResponse sendTrainerMessage(
      @RequestHeader("Authorization") String authorization,
      @PathVariable UUID clientId,
      @Valid @RequestBody ChatMessageRequest request) {
    AppUser trainer = currentUserService.requireRole(authorization, UserRole.TRAINER);
    return trainingService.sendTrainerMessage(trainer, clientId, request);
  }

  @PostMapping("/trainer/clients/{clientId}/workout-suggestions")
  public GeneratedWorkoutResponse generateWorkoutSuggestion(
      @RequestHeader("Authorization") String authorization,
      @PathVariable UUID clientId,
      @RequestBody GenerateWorkoutRequest request) {
    AppUser trainer = currentUserService.requireRole(authorization, UserRole.TRAINER);
    return trainingService.generateWorkoutSuggestion(trainer, clientId, request);
  }

  @GetMapping("/trainer/clients/{clientId}/nutrition-suggestion")
  public NutritionSuggestionResponse getNutritionSuggestion(
      @RequestHeader("Authorization") String authorization,
      @PathVariable UUID clientId) {
    AppUser trainer = currentUserService.requireRole(authorization, UserRole.TRAINER);
    return trainingService.getNutritionSuggestion(trainer, clientId);
  }

  @PatchMapping("/trainer/clients/{clientId}/nutrition-target")
  public NutritionTargetResponse updateNutritionTarget(
      @RequestHeader("Authorization") String authorization,
      @PathVariable UUID clientId,
      @Valid @RequestBody NutritionTargetRequest request) {
    AppUser trainer = currentUserService.requireRole(authorization, UserRole.TRAINER);
    return trainingService.updateNutritionTarget(trainer, clientId, request);
  }

  @PostMapping("/trainer/clients/{clientId}/assigned-exercises")
  @ResponseStatus(HttpStatus.CREATED)
  public AssignedExerciseResponse assignExercise(
      @RequestHeader("Authorization") String authorization,
      @PathVariable UUID clientId,
      @Valid @RequestBody AssignExerciseRequest request) {
    AppUser trainer = currentUserService.requireRole(authorization, UserRole.TRAINER);
    return trainingService.assignExercise(trainer, clientId, request);
  }

  @PatchMapping("/trainer/assigned-exercises/{assignmentId}")
  public AssignedExerciseResponse updateAssignedExercise(
      @RequestHeader("Authorization") String authorization,
      @PathVariable UUID assignmentId,
      @Valid @RequestBody UpdateAssignedExerciseRequest request) {
    AppUser trainer = currentUserService.requireRole(authorization, UserRole.TRAINER);
    return trainingService.updateAssignedExercise(trainer, assignmentId, request);
  }

  @DeleteMapping("/trainer/assigned-exercises/{assignmentId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteAssignedExercise(
      @RequestHeader("Authorization") String authorization, @PathVariable UUID assignmentId) {
    AppUser trainer = currentUserService.requireRole(authorization, UserRole.TRAINER);
    trainingService.deleteAssignedExercise(trainer, assignmentId);
  }
}
