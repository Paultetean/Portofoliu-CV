package com.fitness.auth.training;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.auth.exercise.Exercise;
import com.fitness.auth.exercise.ExerciseService;
import com.fitness.auth.service.AuthException;
import com.fitness.auth.training.TrainingDtos.ChatMessageRequest;
import com.fitness.auth.training.TrainingDtos.ChatMessageResponse;
import com.fitness.auth.training.TrainingDtos.AssignExerciseRequest;
import com.fitness.auth.training.TrainingDtos.AssignedExerciseResponse;
import com.fitness.auth.training.TrainingDtos.AppointmentRequest;
import com.fitness.auth.training.TrainingDtos.AppointmentResponse;
import com.fitness.auth.training.TrainingDtos.ClientAppointmentRequest;
import com.fitness.auth.training.TrainingDtos.ClientProfileRequest;
import com.fitness.auth.training.TrainingDtos.ClientProfileResponse;
import com.fitness.auth.training.TrainingDtos.ClientPlanResponse;
import com.fitness.auth.training.TrainingDtos.GeneratedExerciseResponse;
import com.fitness.auth.training.TrainingDtos.GeneratedWorkoutResponse;
import com.fitness.auth.training.TrainingDtos.GenerateWorkoutRequest;
import com.fitness.auth.training.TrainingDtos.NutritionLogRequest;
import com.fitness.auth.training.TrainingDtos.NutritionLogResponse;
import com.fitness.auth.training.TrainingDtos.NutritionSuggestionResponse;
import com.fitness.auth.training.TrainingDtos.NutritionTargetRequest;
import com.fitness.auth.training.TrainingDtos.NutritionTargetResponse;
import com.fitness.auth.training.TrainingDtos.SelectPlanRequest;
import com.fitness.auth.training.TrainingDtos.SubmitExerciseResultsRequest;
import com.fitness.auth.training.TrainingDtos.TrainerClientResponse;
import com.fitness.auth.training.TrainingDtos.TrainerAvailabilityRequest;
import com.fitness.auth.training.TrainingDtos.TrainerResponse;
import com.fitness.auth.training.TrainingDtos.UpdateAssignedExerciseRequest;
import com.fitness.auth.training.TrainingDtos.UpdateClientPlanRequest;
import com.fitness.auth.training.TrainingDtos.WorkoutLogRequest;
import com.fitness.auth.training.TrainingDtos.WorkoutLogResponse;
import com.fitness.auth.user.AppUser;
import java.io.IOException;
import java.io.InputStream;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrainingService {
  private static final int BOOKING_SLOT_MINUTES = 60;
  private static final int MAX_AVAILABILITY_MINUTES = 480;

  private final TrainerProfileRepository trainerProfileRepository;
  private final TrainingPlanRepository trainingPlanRepository;
  private final ClientPlanRepository clientPlanRepository;
  private final WorkoutLogRepository workoutLogRepository;
  private final ChatMessageRepository chatMessageRepository;
  private final ClientProfileRepository clientProfileRepository;
  private final NutritionTargetRepository nutritionTargetRepository;
  private final DailyNutritionLogRepository dailyNutritionLogRepository;
  private final AssignedExerciseRepository assignedExerciseRepository;
  private final TrainingAppointmentRepository appointmentRepository;
  private final TrainerAvailabilitySlotRepository availabilitySlotRepository;
  private final ExerciseService exerciseService;
  private final TrainingMapper mapper = new TrainingMapper();
  private final ObjectMapper objectMapper = new ObjectMapper();

  public TrainingService(
      TrainerProfileRepository trainerProfileRepository,
      TrainingPlanRepository trainingPlanRepository,
      ClientPlanRepository clientPlanRepository,
      WorkoutLogRepository workoutLogRepository,
      ChatMessageRepository chatMessageRepository,
      ClientProfileRepository clientProfileRepository,
      NutritionTargetRepository nutritionTargetRepository,
      DailyNutritionLogRepository dailyNutritionLogRepository,
      AssignedExerciseRepository assignedExerciseRepository,
      TrainingAppointmentRepository appointmentRepository,
      TrainerAvailabilitySlotRepository availabilitySlotRepository,
      ExerciseService exerciseService) {
    this.trainerProfileRepository = trainerProfileRepository;
    this.trainingPlanRepository = trainingPlanRepository;
    this.clientPlanRepository = clientPlanRepository;
    this.workoutLogRepository = workoutLogRepository;
    this.chatMessageRepository = chatMessageRepository;
    this.clientProfileRepository = clientProfileRepository;
    this.nutritionTargetRepository = nutritionTargetRepository;
    this.dailyNutritionLogRepository = dailyNutritionLogRepository;
    this.assignedExerciseRepository = assignedExerciseRepository;
    this.appointmentRepository = appointmentRepository;
    this.availabilitySlotRepository = availabilitySlotRepository;
    this.exerciseService = exerciseService;
  }

  @Transactional(readOnly = true)
  public ClientProfileResponse getClientProfile(AppUser client) {
    return clientProfileRepository.findByClient(client).map(this::toProfileResponse).orElse(null);
  }

  @Transactional
  public ClientProfileResponse updateClientProfile(AppUser client, ClientProfileRequest request) {
    validateClientProfileRequest(request);
    ClientProfile profile =
        clientProfileRepository.findByClient(client).orElseGet(() -> new ClientProfile(client));

    profile.update(
        request.age(),
        request.height(),
        request.weight(),
        request.targetWeight(),
        request.targetDate(),
        blankToNull(request.sex()),
        blankToNull(request.lifestyle()),
        blankToNull(request.experienceLevel()),
        blankToNull(request.goal()),
        request.daysPerWeek(),
        request.maxSessionDuration(),
        blankToNull(request.restrictions()));

    return toProfileResponse(clientProfileRepository.save(profile));
  }

  @Transactional(readOnly = true)
  public List<TrainerResponse> getTrainers() {
    return trainerProfileRepository.findAll().stream()
        .map(
            trainer ->
                mapper.toTrainerResponse(
                    trainer, trainingPlanRepository.findByTrainerProfileOrderBySessionsAsc(trainer)))
        .toList();
  }

  @Transactional(readOnly = true)
  public ClientPlanResponse getClientPlan(AppUser client) {
    return clientPlanRepository.findByClient(client).map(mapper::toClientPlanResponse).orElse(null);
  }

  @Transactional
  public ClientPlanResponse selectPlan(AppUser client, SelectPlanRequest request) {
    if (clientPlanRepository.findByClient(client).isPresent()) {
      throw AuthException.badRequest("Ai deja un plan activ. Contacteaza antrenorul pentru schimbari.");
    }

    TrainingPlan plan =
        trainingPlanRepository
            .findById(request.planId())
            .orElseThrow(() -> AuthException.notFound("Planul nu exista."));

    return mapper.toClientPlanResponse(clientPlanRepository.save(new ClientPlan(client, plan)));
  }

  @Transactional
  public ClientPlanResponse renewClientPlan(AppUser client) {
    ClientPlan plan = requireClientPlan(client);
    plan.renew();

    return mapper.toClientPlanResponse(clientPlanRepository.save(plan));
  }

  @Transactional(readOnly = true)
  public List<WorkoutLogResponse> getWorkoutLogs(AppUser client) {
    return workoutLogRepository.findByClientOrderByCreatedAtDesc(client).stream()
        .map(mapper::toWorkoutLogResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<AssignedExerciseResponse> getAssignedExercises(AppUser client) {
    return assignedExerciseRepository.findByClientOrderByAssignedAtDesc(client).stream()
        .map(mapper::toAssignedExerciseResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<AppointmentResponse> getClientAppointments(AppUser client) {
    List<AppointmentResponse> appointments = new ArrayList<>();
    appointments.addAll(
        availabilitySlotRepository.findByClientOrderByScheduledAtDesc(client).stream()
            .map(mapper::toAppointmentResponse)
            .toList());
    appointments.addAll(
        appointmentRepository.findByClientOrderByScheduledAtDesc(client).stream()
            .map(mapper::toAppointmentResponse)
            .toList());
    return appointments;
  }

  @Transactional(readOnly = true)
  public List<AppointmentResponse> getAvailableSlotsForClient(AppUser client) {
    ClientPlan plan = requireClientPlan(client);
    return availabilitySlotRepository
        .findByTrainerProfileAndScheduledAtAfterOrderByScheduledAtAsc(
            plan.getTrainingPlan().getTrainerProfile(), LocalDateTime.now())
        .stream()
        .filter(slot -> BOOKING_SLOT_MINUTES == slot.getDurationMinutes())
        .map(mapper::toAppointmentResponse)
        .toList();
  }

  @Transactional
  public AppointmentResponse bookAvailableSlot(AppUser client, UUID slotId) {
    ClientPlan plan = requireClientPlan(client);
    TrainerProfile trainerProfile = plan.getTrainingPlan().getTrainerProfile();
    TrainerAvailabilitySlot slot =
        availabilitySlotRepository
            .findByIdAndTrainerProfile(slotId, trainerProfile)
            .orElseThrow(() -> AuthException.notFound("Slotul nu exista pentru antrenorul tau."));

    if (slot.getClient() != null) {
      throw AuthException.badRequest("Slotul a fost deja rezervat.");
    }

    if (slot.getDurationMinutes() == null || slot.getDurationMinutes() != BOOKING_SLOT_MINUTES) {
      throw AuthException.badRequest("Clientii pot rezerva doar sloturi de 60 de minute.");
    }

    if (slot.getScheduledAt().isBefore(LocalDateTime.now())) {
      throw AuthException.badRequest("Nu poti rezerva un slot din trecut.");
    }

    availabilitySlotRepository.findByClientOrderByScheduledAtDesc(client).stream()
        .filter(
            existingSlot ->
                !existingSlot.getId().equals(slot.getId())
                    && existingSlot
                        .getScheduledAt()
                        .toLocalDate()
                        .equals(slot.getScheduledAt().toLocalDate()))
        .forEach(TrainerAvailabilitySlot::clearBooking);

    slot.book(client);
    return mapper.toAppointmentResponse(availabilitySlotRepository.save(slot));
  }

  @Transactional
  public AppointmentResponse requestClientAppointment(
      AppUser client, ClientAppointmentRequest request) {
    ClientPlan plan = requireClientPlan(client);
    TrainingAppointment appointment =
        new TrainingAppointment(
            client,
            plan.getTrainingPlan().getTrainerProfile(),
            request.scheduledAt(),
            request.durationMinutes(),
            "Solicitare sedinta",
            blankToNull(request.notes()));

    return mapper.toAppointmentResponse(appointmentRepository.save(appointment));
  }

  @Transactional
  public AssignedExerciseResponse submitAssignedExerciseResults(
      AppUser client, UUID assignmentId, SubmitExerciseResultsRequest request) {
    AssignedExercise assignedExercise =
        assignedExerciseRepository
            .findByIdAndClient(assignmentId, client)
            .orElseThrow(() -> AuthException.notFound("Exercitiul nu exista."));

    if (request.repsPerSet().size() != assignedExercise.getSetsCount()
        || request.weightsPerSet().size() != assignedExercise.getSetsCount()) {
      throw AuthException.badRequest("Completeaza repetarile si greutatea pentru fiecare serie.");
    }

    assignedExercise.submitResults(request.repsPerSet(), request.weightsPerSet());
    return mapper.toAssignedExerciseResponse(assignedExerciseRepository.save(assignedExercise));
  }

  @Transactional
  public WorkoutLogResponse createWorkoutLog(AppUser client, WorkoutLogRequest request) {
    WorkoutLog log =
        new WorkoutLog(
            client,
            request.date(),
            request.workoutType().trim(),
            request.duration().trim(),
            request.progress().trim(),
            request.workoutPlan().trim(),
            request.attachmentName());

    return mapper.toWorkoutLogResponse(workoutLogRepository.save(log));
  }

  @Transactional(readOnly = true)
  public NutritionTargetResponse getClientNutritionTarget(AppUser client) {
    return nutritionTargetRepository.findByClient(client).map(mapper::toNutritionTargetResponse).orElse(null);
  }

  @Transactional(readOnly = true)
  public List<NutritionLogResponse> getClientNutritionLogs(AppUser client) {
    return dailyNutritionLogRepository.findByClientOrderByLogDateAsc(client).stream()
        .map(mapper::toNutritionLogResponse)
        .toList();
  }

  @Transactional
  public NutritionLogResponse upsertClientNutritionLog(AppUser client, NutritionLogRequest request) {
    validateNutritionLogRequest(request);

    DailyNutritionLog log =
        dailyNutritionLogRepository
            .findByClientAndLogDate(client, request.date())
            .orElseGet(
                () ->
                    new DailyNutritionLog(
                        client,
                        request.date(),
                        request.calories(),
                        request.protein(),
                        request.carbs(),
                        request.fats(),
                        request.weight(),
                        blankToNull(request.notes())));

    log.update(
        request.calories(),
        request.protein(),
        request.carbs(),
        request.fats(),
        request.weight(),
        blankToNull(request.notes()));

    return mapper.toNutritionLogResponse(dailyNutritionLogRepository.save(log));
  }

  @Transactional(readOnly = true)
  public List<ChatMessageResponse> getClientChat(AppUser client) {
    ClientPlan plan = requireClientPlan(client);
    return getMessages(plan);
  }

  @Transactional
  public ChatMessageResponse sendClientMessage(AppUser client, ChatMessageRequest request) {
    ClientPlan plan = requireClientPlan(client);
    return saveMessage(client, plan.getTrainingPlan().getTrainerProfile(), client, request.text());
  }

  @Transactional(readOnly = true)
  public List<TrainerClientResponse> getTrainerClients(AppUser trainerUser) {
    TrainerProfile trainerProfile = requireTrainerProfile(trainerUser);

    return clientPlanRepository.findByTrainingPlanTrainerProfile(trainerProfile).stream()
        .map(
            plan ->
                new TrainerClientResponse(
                    plan.getClient().getId(),
                    plan.getClient().getFullName(),
                    plan.getClient().getEmail(),
                    plan.getTrainingPlan().getId(),
                    plan.getTrainingPlan().getSessions(),
                    plan.getTrainingPlan().getPrice(),
                    plan.getActiveFocus(),
                    plan.getTrainerNotes(),
                    plan.getSelectedAt(),
                    plan.getUpdatedAt(),
                    workoutLogRepository.findByClientOrderByCreatedAtDesc(plan.getClient()).stream()
                        .map(mapper::toWorkoutLogResponse)
                        .toList(),
                    assignedExerciseRepository
                        .findByClientAndTrainerProfileOrderByAssignedAtDesc(
                            plan.getClient(), trainerProfile)
                        .stream()
                        .map(mapper::toAssignedExerciseResponse)
                        .toList(),
                    getClientAppointments(plan.getClient()),
                    getMessages(plan),
                    clientProfileRepository
                        .findByClient(plan.getClient())
                        .map(this::toProfileResponse)
                        .orElse(null),
                    nutritionTargetRepository
                        .findByClient(plan.getClient())
                        .map(mapper::toNutritionTargetResponse)
                        .orElse(null),
                    dailyNutritionLogRepository.findByClientOrderByLogDateAsc(plan.getClient()).stream()
                        .map(mapper::toNutritionLogResponse)
                        .toList()))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<AppointmentResponse> getTrainerAppointments(AppUser trainerUser) {
    TrainerProfile trainerProfile = requireTrainerProfile(trainerUser);
    List<AppointmentResponse> appointments = new ArrayList<>();
    appointments.addAll(
        availabilitySlotRepository.findByTrainerProfileOrderByScheduledAtDesc(trainerProfile).stream()
            .map(mapper::toAppointmentResponse)
            .toList());
    appointments.addAll(
        appointmentRepository.findByTrainerProfileOrderByScheduledAtDesc(trainerProfile).stream()
            .map(mapper::toAppointmentResponse)
            .toList());
    return appointments;
  }

  @Transactional(readOnly = true)
  public List<AppointmentResponse> getTrainerAvailability(AppUser trainerUser) {
    TrainerProfile trainerProfile = requireTrainerProfile(trainerUser);
    return availabilitySlotRepository.findByTrainerProfileOrderByScheduledAtDesc(trainerProfile).stream()
        .map(mapper::toAppointmentResponse)
        .toList();
  }

  @Transactional
  public List<AppointmentResponse> createTrainerAvailability(
      AppUser trainerUser, TrainerAvailabilityRequest request) {
    TrainerProfile trainerProfile = requireTrainerProfile(trainerUser);

    if (request.durationMinutes() < BOOKING_SLOT_MINUTES
        || request.durationMinutes() > MAX_AVAILABILITY_MINUTES) {
      throw AuthException.badRequest("Intervalul disponibil trebuie sa fie intre 60 si 480 minute.");
    }

    if (request.durationMinutes() % BOOKING_SLOT_MINUTES != 0) {
      throw AuthException.badRequest("Intervalul trebuie sa poata fi impartit in rezervari de 60 minute.");
    }

    LocalDateTime now = LocalDateTime.now();
    LocalDateTime intervalEnd = request.scheduledAt().plusMinutes(request.durationMinutes());

    if (!intervalEnd.isAfter(now)) {
      throw AuthException.badRequest("Nu poti deschide disponibilitate in trecut.");
    }

    String title =
        blankToNull(request.title()) == null ? "Sedinta antrenament" : request.title().trim();
    List<TrainerAvailabilitySlot> slots = new ArrayList<>();
    int slotsCount = request.durationMinutes() / BOOKING_SLOT_MINUTES;

    for (int index = 0; index < slotsCount; index += 1) {
      LocalDateTime slotStart =
          request.scheduledAt().plusMinutes((long) index * BOOKING_SLOT_MINUTES);

      if (slotStart.isBefore(now)
          || availabilitySlotRepository.existsByTrainerProfileAndScheduledAt(
              trainerProfile, slotStart)) {
        continue;
      }

      slots.add(
          new TrainerAvailabilitySlot(
              trainerProfile,
              slotStart,
              BOOKING_SLOT_MINUTES,
              title,
              blankToNull(request.notes())));
    }

    if (slots.isEmpty()) {
      throw AuthException.badRequest("Intervalul ales este deja deschis sau nu mai are ore viitoare.");
    }

    return availabilitySlotRepository.saveAll(slots).stream()
        .map(mapper::toAppointmentResponse)
        .toList();
  }

  @Transactional
  public AppointmentResponse createTrainerAppointment(AppUser trainerUser, AppointmentRequest request) {
    ClientPlan plan = requireTrainerClientPlan(trainerUser, request.clientId());
    TrainingAppointment appointment =
        new TrainingAppointment(
            plan.getClient(),
            plan.getTrainingPlan().getTrainerProfile(),
            request.scheduledAt(),
            request.durationMinutes(),
            request.title().trim(),
            blankToNull(request.notes()));

    return mapper.toAppointmentResponse(appointmentRepository.save(appointment));
  }

  @Transactional
  public AssignedExerciseResponse assignExercise(
      AppUser trainerUser, UUID clientId, AssignExerciseRequest request) {
    ClientPlan plan = requireTrainerClientPlan(trainerUser, clientId);

    validateExercisePrescription(request.setsCount(), request.minReps(), request.maxReps());

    AssignedExercise assignedExercise =
        new AssignedExercise(
            plan.getClient(),
            plan.getTrainingPlan().getTrainerProfile(),
            request.exerciseId().trim(),
            request.exerciseName().trim(),
            blankToNull(request.gifUrl()),
            normalizeDayName(request.dayName()),
            request.scheduledDate(),
            normalizeMuscleGroups(request.muscleGroups()),
            request.setsCount(),
            request.minReps(),
            request.maxReps(),
            blankToNull(request.notes()),
            request.suggestedWeight());

    return mapper.toAssignedExerciseResponse(assignedExerciseRepository.save(assignedExercise));
  }

  @Transactional
  public AssignedExerciseResponse updateAssignedExercise(
      AppUser trainerUser, UUID assignmentId, UpdateAssignedExerciseRequest request) {
    TrainerProfile trainerProfile = requireTrainerProfile(trainerUser);
    AssignedExercise assignedExercise =
        assignedExerciseRepository
            .findByIdAndTrainerProfile(assignmentId, trainerProfile)
            .orElseThrow(() -> AuthException.notFound("Exercitiul atribuit nu exista."));

    validateExercisePrescription(request.setsCount(), request.minReps(), request.maxReps());
    assignedExercise.updatePrescription(
        normalizeDayName(request.dayName()),
        request.scheduledDate(),
        normalizeMuscleGroups(request.muscleGroups()),
        request.setsCount(),
        request.minReps(),
        request.maxReps(),
        blankToNull(request.notes()),
        request.suggestedWeight());

    return mapper.toAssignedExerciseResponse(assignedExerciseRepository.save(assignedExercise));
  }

  @Transactional
  public void deleteAssignedExercise(AppUser trainerUser, UUID assignmentId) {
    TrainerProfile trainerProfile = requireTrainerProfile(trainerUser);
    AssignedExercise assignedExercise =
        assignedExerciseRepository
            .findByIdAndTrainerProfile(assignmentId, trainerProfile)
            .orElseThrow(() -> AuthException.notFound("Exercitiul atribuit nu exista."));

    assignedExerciseRepository.delete(assignedExercise);
  }

  @Transactional
  public TrainerClientResponse updateClientPlan(
      AppUser trainerUser, UUID clientId, UpdateClientPlanRequest request) {
    ClientPlan plan = requireTrainerClientPlan(trainerUser, clientId);
    plan.updateTraining(request.focus().trim(), blankToNull(request.trainerNotes()));
    clientPlanRepository.save(plan);

    return getTrainerClients(trainerUser).stream()
        .filter(client -> client.clientId().equals(clientId))
        .findFirst()
        .orElseThrow(() -> AuthException.notFound("Clientul nu exista."));
  }

  @Transactional(readOnly = true)
  public NutritionSuggestionResponse getNutritionSuggestion(AppUser trainerUser, UUID clientId) {
    ClientPlan plan = requireTrainerClientPlan(trainerUser, clientId);
    ClientProfile profile =
        clientProfileRepository
            .findByClient(plan.getClient())
            .orElseThrow(
                () ->
                    AuthException.badRequest(
                        "Clientul trebuie sa completeze Datele mele inainte de sugestia nutritionala."));

    return buildNutritionSuggestion(profile);
  }

  @Transactional
  public NutritionTargetResponse updateNutritionTarget(
      AppUser trainerUser, UUID clientId, NutritionTargetRequest request) {
    ClientPlan plan = requireTrainerClientPlan(trainerUser, clientId);
    validateNutritionTargetRequest(request);

    NutritionTarget target =
        nutritionTargetRepository
            .findByClient(plan.getClient())
            .orElseGet(
                () ->
                    new NutritionTarget(
                        plan.getClient(),
                        plan.getTrainingPlan().getTrainerProfile(),
                        request.calories(),
                        request.protein(),
                        request.carbs(),
                        request.fats(),
                        blankToNull(request.notes())));

    target.update(
        plan.getTrainingPlan().getTrainerProfile(),
        request.calories(),
        request.protein(),
        request.carbs(),
        request.fats(),
        blankToNull(request.notes()));

    return mapper.toNutritionTargetResponse(nutritionTargetRepository.save(target));
  }

  @Transactional
  public ChatMessageResponse sendTrainerMessage(
      AppUser trainerUser, UUID clientId, ChatMessageRequest request) {
    ClientPlan plan = requireTrainerClientPlan(trainerUser, clientId);
    return saveMessage(
        plan.getClient(), plan.getTrainingPlan().getTrainerProfile(), trainerUser, request.text());
  }

  @Transactional(readOnly = true)
  public GeneratedWorkoutResponse generateWorkoutSuggestion(
      AppUser trainerUser, UUID clientId, GenerateWorkoutRequest request) {
    ClientPlan plan = requireTrainerClientPlan(trainerUser, clientId);
    ClientProfile profile = clientProfileRepository.findByClient(plan.getClient()).orElse(null);
    LocalDate scheduledDate = request.scheduledDate() == null ? LocalDate.now() : request.scheduledDate();
    String prompt = blankToNull(request.prompt());
    String context =
        String.join(
                " ",
                List.of(
                    nullToEmpty(plan.getActiveFocus()),
                    nullToEmpty(plan.getTrainerNotes()),
                    nullToEmpty(profile == null ? null : profile.getGoal()),
                    nullToEmpty(prompt)))
            .toLowerCase(Locale.ROOT);
    WorkoutModelPrediction prediction = predictWorkoutStructure(profile, plan, prompt);
    List<String> targetGroups = prediction.targetGroups();
    List<Exercise> sortedCandidates =
        exerciseService.getAllExercises().stream()
            .filter(exercise -> matchesAnyGroup(exercise, targetGroups))
            .filter(exercise -> !isRestricted(exercise, profile, prompt))
            .filter(exercise -> !matchesAvoidPatterns(exercise, prediction.avoidPatterns()))
            .filter(
                exercise ->
                    !matchesOpposingPriority(
                        exercise, prediction.priorityTerms(), context))
            .sorted(
                Comparator.comparingInt(
                        (Exercise exercise) ->
                            exerciseScore(
                                exercise,
                                context,
                                prediction.priorityTerms(),
                                prediction.preferredEquipment()))
                    .reversed()
                    .thenComparing(Exercise::name, Comparator.nullsLast(String::compareToIgnoreCase)))
            .toList();

    if (sortedCandidates.isEmpty()) {
      sortedCandidates =
          exerciseService.getAllExercises().stream()
              .filter(exercise -> !isRestricted(exercise, profile, prompt))
              .filter(exercise -> !matchesAvoidPatterns(exercise, prediction.avoidPatterns()))
              .filter(
                  exercise ->
                      !matchesOpposingPriority(
                          exercise, prediction.priorityTerms(), context))
              .sorted(
                  Comparator.comparingInt(
                          (Exercise exercise) ->
                              exerciseScore(
                                  exercise,
                                  context,
                                  prediction.priorityTerms(),
                                  prediction.preferredEquipment()))
                      .reversed()
                      .thenComparing(
                          Exercise::name, Comparator.nullsLast(String::compareToIgnoreCase)))
              .toList();
    }

    int exerciseCount = Math.min(prediction.exerciseCount(), sortedCandidates.size());
    List<Exercise> candidates =
        selectBalancedCandidates(sortedCandidates, prediction.priorityTerms(), exerciseCount);
    int sets = prediction.sets();
    int[] reps = new int[] {prediction.minReps(), prediction.maxReps()};
    String dayName =
        "AI - "
            + scheduledDate.format(
                java.time.format.DateTimeFormatter.ofPattern("d MMMM")
                    .withLocale(Locale.forLanguageTag("ro-RO")));
    String rationale =
        buildGenerationRationale(
            plan,
            profile,
            prompt,
            targetGroups,
            prediction.priorityTerms(),
            exerciseCount,
            sets,
            reps,
            prediction.modelSamples());

    List<GeneratedExerciseResponse> generatedExercises =
        candidates.stream()
            .limit(exerciseCount)
            .map(
                exercise ->
                    new GeneratedExerciseResponse(
                        exercise.exerciseId(),
                        exercise.name(),
                        exercise.gifUrl(),
                        dayName,
                        scheduledDate,
                        normalizeMuscleGroups(
                            !emptyList(exercise.bodyParts()).isEmpty()
                                ? exercise.bodyParts()
                                : exercise.targetMuscles()),
                        sets,
                        reps[0],
                        reps[1],
                        null,
                        buildGeneratedExerciseNotes(exercise, profile, prompt)))
            .toList();

    return new GeneratedWorkoutResponse(dayName, rationale, generatedExercises);
  }

  private ClientPlan requireClientPlan(AppUser client) {
    return clientPlanRepository
        .findByClient(client)
        .orElseThrow(() -> AuthException.badRequest("Nu ai un plan activ."));
  }

  private TrainerProfile requireTrainerProfile(AppUser trainerUser) {
    return trainerProfileRepository
        .findByUser(trainerUser)
        .orElseThrow(() -> AuthException.notFound("Profilul de antrenor nu exista."));
  }

  private ClientPlan requireTrainerClientPlan(AppUser trainerUser, UUID clientId) {
    TrainerProfile trainerProfile = requireTrainerProfile(trainerUser);

    return clientPlanRepository.findByTrainingPlanTrainerProfile(trainerProfile).stream()
        .filter(plan -> plan.getClient().getId().equals(clientId))
        .findFirst()
        .orElseThrow(() -> AuthException.notFound("Clientul nu exista pentru acest antrenor."));
  }

  private List<ChatMessageResponse> getMessages(ClientPlan plan) {
    return chatMessageRepository
        .findByClientAndTrainerProfileOrderByCreatedAtAsc(
            plan.getClient(), plan.getTrainingPlan().getTrainerProfile())
        .stream()
        .map(mapper::toChatMessageResponse)
        .toList();
  }

  private void validateExercisePrescription(int setsCount, int minReps, int maxReps) {
    if (setsCount < 1 || minReps < 1 || maxReps < minReps) {
      throw AuthException.badRequest("Seriile si intervalul de repetari nu sunt valide.");
    }
  }

  private String normalizeDayName(String value) {
    String dayName = blankToNull(value);
    return dayName == null ? "Ziua de antrenament" : dayName;
  }

  private List<String> normalizeMuscleGroups(List<String> values) {
    if (values == null) {
      return List.of();
    }

    List<String> normalized = new ArrayList<>();
    for (String value : values) {
      String trimmed = blankToNull(value);
      if (trimmed != null && !normalized.contains(trimmed)) {
        normalized.add(trimmed);
      }
    }

    return normalized;
  }

  private ChatMessageResponse saveMessage(
      AppUser client, TrainerProfile trainerProfile, AppUser sender, String text) {
    if (text == null || text.trim().isBlank()) {
      throw AuthException.badRequest("Mesajul nu poate fi gol.");
    }

    return mapper.toChatMessageResponse(
        chatMessageRepository.save(new ChatMessage(client, trainerProfile, sender, text.trim())));
  }

  private List<String> inferTargetGroups(String context) {
    Set<String> groups = new LinkedHashSet<>();

    if (containsAny(context, "push", "piept", "chest", "impins")) {
      groups.addAll(List.of("chest", "upper arms", "shoulders"));
    }
    if (containsAny(context, "pull", "spate", "back", "tractiuni")) {
      groups.addAll(List.of("back", "upper arms"));
    }
    if (containsAny(context, "picioare", "legs", "lower", "glute", "fesier")) {
      groups.addAll(List.of("upper legs", "lower legs"));
    }
    if (containsAny(context, "core", "abdomen", "abs", "talie")) {
      groups.add("waist");
    }
    if (containsAny(context, "forta", "strength", "power")) {
      groups.addAll(List.of("chest", "back", "upper legs"));
    }
    if (containsAny(context, "slabire", "cardio", "conditionare", "rezistenta")) {
      groups.addAll(List.of("waist", "upper legs", "lower legs"));
    }

    if (groups.isEmpty()) {
      groups.addAll(List.of("chest", "back", "upper legs", "waist"));
    }

    return List.copyOf(groups);
  }

  private List<String> inferPriorityTerms(String context) {
    Set<String> terms = new LinkedHashSet<>();

    if (containsAny(context, "triceps", "tricep")) {
      terms.addAll(List.of("triceps", "upper arms"));
    }
    if (containsAny(context, "biceps", "bicep")) {
      terms.addAll(List.of("biceps", "upper arms"));
    }
    if (containsAny(context, "piept", "chest", "pectorals")) {
      terms.addAll(List.of("pectorals", "chest"));
    }
    if (containsAny(context, "spate", "back", "lats", "latime")) {
      terms.addAll(List.of("back", "lats"));
    }
    if (containsAny(context, "umeri", "shoulders", "delts")) {
      terms.addAll(List.of("delts", "shoulders"));
    }
    if (containsAny(context, "cvadriceps", "quads", "coapse anterior")) {
      terms.addAll(List.of("quads", "upper legs"));
    }
    if (containsAny(context, "fesieri", "glute", "glutes")) {
      terms.addAll(List.of("glutes", "upper legs"));
    }
    if (containsAny(context, "femurali", "hamstrings", "posterior")) {
      terms.addAll(List.of("hamstrings", "upper legs"));
    }
    if (containsAny(context, "gambe", "calves")) {
      terms.addAll(List.of("calves", "lower legs"));
    }
    if (containsAny(context, "core", "abdomen", "abs")) {
      terms.addAll(List.of("abs", "waist"));
    }

    return List.copyOf(terms);
  }

  private WorkoutModelPrediction predictWorkoutStructure(
      ClientProfile profile, ClientPlan plan, String prompt) {
    try (InputStream inputStream =
        TrainingService.class.getResourceAsStream("/workout_model.json")) {
      if (inputStream == null) {
        return fallbackPrediction(profile, plan, prompt);
      }

      JsonNode model = objectMapper.readTree(inputStream);
      List<Double> features = buildModelFeatures(profile, plan, prompt);

      if ("knn-v1".equals(model.path("modelType").asText())) {
        return predictKnnWorkout(model, features, profile, plan, prompt);
      }

      return predictCentroidWorkout(model, features, profile, plan, prompt);
    } catch (IOException exception) {
      return fallbackPrediction(profile, plan, prompt);
    }
  }

  private WorkoutModelPrediction predictKnnWorkout(
      JsonNode model, List<Double> features, ClientProfile profile, ClientPlan plan, String prompt) {
    List<ModelNeighbor> neighbors = new ArrayList<>();

    for (JsonNode exampleNode : model.path("examples")) {
      JsonNode vector = exampleNode.path("vector");
      JsonNode label = exampleNode.path("label");

      if (!vector.isArray() || !label.isObject()) {
        continue;
      }

      double distance = modelDistance(features, vector);
      double weight = 1.0 / Math.max(distance, 0.0001);
      neighbors.add(new ModelNeighbor(label, weight, distance));
    }

    if (neighbors.isEmpty()) {
      return fallbackPrediction(profile, plan, prompt);
    }

    neighbors.sort(Comparator.comparingDouble(ModelNeighbor::distance));
    int k = Math.max(1, model.path("k").asInt(7));
    List<ModelNeighbor> topNeighbors = neighbors.stream().limit(k).toList();
    JsonNode nearestLabel = topNeighbors.get(0).label();
    String context =
        String.join(
                " ",
                nullToEmpty(plan.getActiveFocus()),
                nullToEmpty(plan.getTrainerNotes()),
                nullToEmpty(profile == null ? null : profile.getGoal()),
                nullToEmpty(prompt))
            .toLowerCase(Locale.ROOT);

    List<String> targetGroups = toStringList(nearestLabel.path("targetGroups"));
    if (targetGroups.isEmpty()) {
      targetGroups = inferTargetGroups(context);
    }

    List<String> priorityTerms = toStringList(nearestLabel.path("priorityTerms"));
    if (priorityTerms.isEmpty()) {
      priorityTerms = inferPriorityTerms(context);
    }

    int minReps = clamp(nearestLabel.path("minReps").asInt(8), 1, 30);
    int maxReps = clamp(nearestLabel.path("maxReps").asInt(12), minReps, 40);

    return new WorkoutModelPrediction(
        targetGroups,
        priorityTerms,
        clamp(nearestLabel.path("sets").asInt(3), 2, 5),
        minReps,
        maxReps,
        clamp(nearestLabel.path("exerciseCount").asInt(5), 3, 7),
        toStringList(nearestLabel.path("avoidPatterns")),
        toStringList(nearestLabel.path("preferredEquipment")),
        model.path("trainingSamples").asInt(topNeighbors.size()));
  }

  private WorkoutModelPrediction predictCentroidWorkout(
      JsonNode model, List<Double> features, ClientProfile profile, ClientPlan plan, String prompt) {
      JsonNode bestLabel = null;
      double bestDistance = Double.MAX_VALUE;
      int bestSamples = 0;

      for (JsonNode centroidNode : model.path("centroids")) {
        JsonNode centroid = centroidNode.path("centroid");
        double distance = 0;

        for (int index = 0; index < features.size(); index += 1) {
          double delta = features.get(index) - centroid.path(index).asDouble();
          distance += delta * delta;
        }

        if (distance < bestDistance) {
          bestDistance = distance;
          bestLabel = centroidNode.path("label");
          bestSamples = centroidNode.path("samples").asInt();
        }
      }

      if (bestLabel == null) {
        return fallbackPrediction(profile, plan, prompt);
      }

      return new WorkoutModelPrediction(
          toStringList(bestLabel.path("targetGroups")),
          toStringList(bestLabel.path("priorityTerms")),
          bestLabel.path("sets").asInt(3),
          bestLabel.path("minReps").asInt(8),
          bestLabel.path("maxReps").asInt(12),
          bestLabel.path("exerciseCount").asInt(5),
          toStringList(bestLabel.path("avoidPatterns")),
          toStringList(bestLabel.path("preferredEquipment")),
          bestSamples);
  }

  private List<Double> buildModelFeatures(ClientProfile profile, ClientPlan plan, String prompt) {
    double age = profile == null || profile.getAge() == null ? 0.3 : profile.getAge() / 100.0;
    double heightMeters =
        profile == null || profile.getHeight() == null ? 1.75 : profile.getHeight() / 100.0;
    double weight = profile == null || profile.getWeight() == null ? 75.0 : profile.getWeight();
    double bmi = Math.min((weight / Math.max(heightMeters * heightMeters, 1)) / 50.0, 1);
    int duration =
        profile == null || profile.getMaxSessionDuration() == null
            ? 60
            : profile.getMaxSessionDuration();
    String text =
        String.join(
                " ",
                nullToEmpty(profile == null ? null : profile.getSex()),
                nullToEmpty(profile == null ? null : profile.getExperienceLevel()),
                nullToEmpty(profile == null ? null : profile.getGoal()),
                nullToEmpty(profile == null ? null : profile.getRestrictions()),
                nullToEmpty(plan.getActiveFocus()),
                nullToEmpty(plan.getTrainerNotes()),
                nullToEmpty(prompt))
            .toLowerCase(Locale.ROOT);

    return List.of(
        age,
        bmi,
        containsAny(text, "masculin") ? 1.0 : 0.0,
        containsAny(text, "feminin") ? 1.0 : 0.0,
        containsAny(text, "incepator") ? 1.0 : 0.0,
        containsAny(text, "intermediar") ? 1.0 : 0.0,
        containsAny(text, "avansat") ? 1.0 : 0.0,
        containsAny(text, "forta") ? 1.0 : 0.0,
        containsAny(text, "masa", "hipertrofie") ? 1.0 : 0.0,
        containsAny(text, "slabire") ? 1.0 : 0.0,
        containsAny(text, "conditionare", "rezistenta") ? 1.0 : 0.0,
        containsAny(text, "genunchi") ? 1.0 : 0.0,
        containsAny(text, "umar") ? 1.0 : 0.0,
        containsAny(text, "lombar", "spate sensibil") ? 1.0 : 0.0,
        containsAny(text, "push", "piept") ? 1.0 : 0.0,
        containsAny(text, "pull", "spate") ? 1.0 : 0.0,
        containsAny(text, "picioare", "legs") ? 1.0 : 0.0,
        containsAny(text, "core", "abdomen") ? 1.0 : 0.0,
        containsAny(text, "fara echipament", "bodyweight") ? 1.0 : 0.0,
        containsAny(text, "gantere", "dumbbell") ? 1.0 : 0.0,
        containsAny(text, "fara flotari", "no push", "fara push-up") ? 1.0 : 0.0,
        containsAny(text, "fara tractiuni", "fara pull-up", "no pull") ? 1.0 : 0.0,
        containsAny(text, "fara dips", "no dips") ? 1.0 : 0.0,
        containsAny(text, "fara genuflexiuni", "fara squat", "no squat") ? 1.0 : 0.0,
        containsAny(text, "piept", "chest", "pectorals") ? 1.0 : 0.0,
        containsAny(text, "triceps", "tricep") ? 1.0 : 0.0,
        containsAny(text, "biceps", "bicep") ? 1.0 : 0.0,
        containsAny(text, "umeri", "shoulders", "delts") ? 1.0 : 0.0,
        containsAny(text, "spate", "back") ? 1.0 : 0.0,
        containsAny(text, "lats", "latime") ? 1.0 : 0.0,
        containsAny(text, "cvadriceps", "quads", "coapse anterior") ? 1.0 : 0.0,
        containsAny(text, "fesieri", "glute", "glutes") ? 1.0 : 0.0,
        containsAny(text, "femurali", "hamstrings", "posterior") ? 1.0 : 0.0,
        containsAny(text, "gambe", "calves") ? 1.0 : 0.0,
        containsAny(text, "abdomen", "abs", "core") ? 1.0 : 0.0,
        containsAny(text, "cablu", "cable") ? 1.0 : 0.0,
        containsAny(text, "bara", "barbell") ? 1.0 : 0.0,
        containsAny(text, "aparat", "machine", "leverage", "sled") ? 1.0 : 0.0,
        containsAny(text, "fara indreptari", "no deadlift", "avoid deadlift") ? 1.0 : 0.0,
        containsAny(text, "fara impins deasupra", "overhead press", "shoulder press")
            ? 1.0
            : 0.0,
        containsAny(text, "low impact", "fara impact", "fara sarituri") ? 1.0 : 0.0,
        duration <= 45 ? 1.0 : 0.0,
        duration >= 90 ? 1.0 : 0.0,
        containsAny(text, "focus", "accent", "prioritar", "prioritate", "dominant")
            ? 1.0
            : 0.0);
  }

  private WorkoutModelPrediction fallbackPrediction(ClientProfile profile, ClientPlan plan, String prompt) {
    String context =
        String.join(
                " ",
                nullToEmpty(plan.getActiveFocus()),
                nullToEmpty(plan.getTrainerNotes()),
                nullToEmpty(profile == null ? null : profile.getGoal()),
                nullToEmpty(prompt))
            .toLowerCase(Locale.ROOT);
    int[] reps = getSuggestedRepRange(context, profile);

    return new WorkoutModelPrediction(
        inferTargetGroups(context),
        inferPriorityTerms(context),
        getSuggestedSets(profile),
        reps[0],
        reps[1],
        getSuggestedExerciseCount(profile),
        inferAvoidPatterns(context),
        inferPreferredEquipment(context),
        0);
  }

  private double modelDistance(List<Double> features, JsonNode vector) {
    int featureCount = Math.min(features.size(), vector.size());
    double distance = 0;

    for (int index = 0; index < featureCount; index += 1) {
      double delta = features.get(index) - vector.path(index).asDouble();
      distance += delta * delta;
    }

    return Math.sqrt(distance);
  }

  private int weightedInt(List<ModelNeighbor> neighbors, String fieldName, int fallback) {
    double weightedValue = 0;
    double totalWeight = 0;

    for (ModelNeighbor neighbor : neighbors) {
      JsonNode value = neighbor.label().path(fieldName);
      if (value.isMissingNode() || value.isNull()) {
        continue;
      }
      weightedValue += value.asDouble() * neighbor.weight();
      totalWeight += neighbor.weight();
    }

    if (totalWeight == 0) {
      return fallback;
    }

    return (int) Math.round(weightedValue / totalWeight);
  }

  private List<String> weightedStringList(
      List<ModelNeighbor> neighbors, String fieldName, int limit) {
    Map<String, Double> scores = new LinkedHashMap<>();

    for (ModelNeighbor neighbor : neighbors) {
      for (JsonNode value : neighbor.label().path(fieldName)) {
        String text = blankToNull(value.asText());
        if (text != null) {
          scores.merge(text, neighbor.weight(), Double::sum);
        }
      }
    }

    return scores.entrySet().stream()
        .sorted(
            Map.Entry.<String, Double>comparingByValue()
                .reversed()
                .thenComparing(Map.Entry.comparingByKey()))
        .limit(limit)
        .map(Map.Entry::getKey)
        .toList();
  }

  private int clamp(int value, int min, int max) {
    return Math.max(min, Math.min(max, value));
  }

  private List<String> toStringList(JsonNode arrayNode) {
    List<String> values = new ArrayList<>();
    for (JsonNode node : arrayNode) {
      values.add(node.asText());
    }
    return values;
  }

  private boolean matchesAnyGroup(Exercise exercise, List<String> targetGroups) {
    String searchable =
        String.join(
                " ",
                String.join(" ", emptyList(exercise.bodyParts())),
                String.join(" ", emptyList(exercise.targetMuscles())),
                String.join(" ", emptyList(exercise.secondaryMuscles())))
            .toLowerCase(Locale.ROOT);

    return targetGroups.stream().anyMatch(searchable::contains);
  }

  private boolean isRestricted(Exercise exercise, ClientProfile profile, String prompt) {
    String restrictions =
        (nullToEmpty(profile == null ? null : profile.getRestrictions()) + " " + nullToEmpty(prompt))
            .toLowerCase(Locale.ROOT);
    String exerciseText =
        String.join(
                " ",
                nullToEmpty(exercise.name()),
                String.join(" ", emptyList(exercise.bodyParts())),
                String.join(" ", emptyList(exercise.targetMuscles())),
                String.join(" ", emptyList(exercise.instructions())))
            .toLowerCase(Locale.ROOT);

    if (containsAny(restrictions, "genunchi", "knee") && containsAny(exerciseText, "upper legs", "lower legs", "squat", "lunge")) {
      return true;
    }
    if (containsAny(restrictions, "umar", "shoulder") && containsAny(exerciseText, "shoulder", "press")) {
      return true;
    }
    if (containsAny(restrictions, "lombar", "spate", "back pain") && containsAny(exerciseText, "deadlift", "waist", "lower back")) {
      return true;
    }
    if (containsAny(restrictions, "fara flotari", "no push", "fara push-up")
        && containsAny(exerciseText, "push-up", "push up", "pushup")) {
      return true;
    }

    return false;
  }

  private boolean matchesAvoidPatterns(Exercise exercise, List<String> avoidPatterns) {
    if (avoidPatterns == null || avoidPatterns.isEmpty()) {
      return false;
    }

    String exerciseText =
        String.join(
                " ",
                nullToEmpty(exercise.name()),
                String.join(" ", emptyList(exercise.bodyParts())),
                String.join(" ", emptyList(exercise.targetMuscles())),
                String.join(" ", emptyList(exercise.equipments())),
                String.join(" ", emptyList(exercise.instructions())))
            .toLowerCase(Locale.ROOT);

    return avoidPatterns.stream()
        .map(pattern -> pattern.toLowerCase(Locale.ROOT))
        .anyMatch(exerciseText::contains);
  }

  private List<String> inferAvoidPatterns(String context) {
    if (containsAny(context, "fara flotari", "no push", "fara push-up")) {
      return List.of("push-up", "push up", "pushup");
    }
    if (containsAny(context, "fara tractiuni", "fara pull-up", "no pull")) {
      return List.of("pull-up", "pull up", "pullup", "chin-up", "chin up", "chinup");
    }
    if (containsAny(context, "fara dips", "no dips")) {
      return List.of("dip", "dips");
    }
    if (containsAny(context, "fara genuflexiuni", "fara squat", "no squat")) {
      return List.of("squat");
    }
    return List.of();
  }

  private List<String> inferPreferredEquipment(String context) {
    List<String> equipment = new ArrayList<>();
    if (containsAny(context, "gantere", "dumbbell")) {
      equipment.add("dumbbell");
    }
    if (containsAny(context, "cablu", "cable")) {
      equipment.add("cable");
    }
    if (containsAny(context, "bara", "barbell")) {
      equipment.add("barbell");
    }
    if (containsAny(context, "fara echipament", "bodyweight")) {
      equipment.add("body weight");
    }
    return equipment;
  }

  private List<Exercise> selectBalancedCandidates(
      List<Exercise> sortedCandidates, List<String> priorityTerms, int limit) {
    if (limit <= 0 || sortedCandidates.isEmpty()) {
      return List.of();
    }
    if (priorityTerms == null || priorityTerms.isEmpty()) {
      return sortedCandidates.stream().limit(limit).toList();
    }

    List<Exercise> selected = new ArrayList<>();
    int priorityLimit = limit >= 5 ? Math.max(2, (int) Math.ceil(limit * 0.65)) : limit;

    for (Exercise exercise : sortedCandidates) {
      if (selected.size() >= priorityLimit) {
        break;
      }
      if (isPriorityExercise(exercise, priorityTerms)) {
        selected.add(exercise);
      }
    }

    for (Exercise exercise : sortedCandidates) {
      if (selected.size() >= limit) {
        break;
      }
      if (!containsExercise(selected, exercise) && !isPriorityExercise(exercise, priorityTerms)) {
        selected.add(exercise);
      }
    }

    for (Exercise exercise : sortedCandidates) {
      if (selected.size() >= limit) {
        break;
      }
      if (!containsExercise(selected, exercise)) {
        selected.add(exercise);
      }
    }

    return selected;
  }

  private boolean containsExercise(List<Exercise> exercises, Exercise checkedExercise) {
    return exercises.stream()
        .anyMatch(exercise -> nullToEmpty(exercise.exerciseId()).equals(checkedExercise.exerciseId()));
  }

  private boolean isPriorityExercise(Exercise exercise, List<String> priorityTerms) {
    List<String> specificTerms =
        priorityTerms.stream()
            .filter(term -> !isGenericPriorityTerm(term))
            .toList();
    List<String> checkedTerms = specificTerms.isEmpty() ? priorityTerms : specificTerms;
    String searchable =
        String.join(
                " ",
                nullToEmpty(exercise.name()),
                String.join(" ", emptyList(exercise.bodyParts())),
                String.join(" ", emptyList(exercise.targetMuscles())),
                String.join(" ", emptyList(exercise.secondaryMuscles())))
            .toLowerCase(Locale.ROOT);

    return checkedTerms.stream().anyMatch(term -> containsAny(searchable, term));
  }

  private boolean isGenericPriorityTerm(String term) {
    return containsAny(term, "upper arms", "upper legs", "lower legs", "waist", "chest", "back");
  }

  private boolean matchesOpposingPriority(
      Exercise exercise, List<String> priorityTerms, String context) {
    String searchable =
        String.join(
                " ",
                nullToEmpty(exercise.name()),
                String.join(" ", emptyList(exercise.bodyParts())),
                String.join(" ", emptyList(exercise.targetMuscles())),
                String.join(" ", emptyList(exercise.secondaryMuscles())))
            .toLowerCase(Locale.ROOT);
    boolean tricepsPriority =
        priorityTerms != null && priorityTerms.stream().anyMatch(term -> containsAny(term, "triceps"));
    boolean bicepsPriority =
        priorityTerms != null && priorityTerms.stream().anyMatch(term -> containsAny(term, "biceps"));

    if (tricepsPriority && !containsAny(context, "biceps") && containsAny(searchable, "biceps")) {
      return true;
    }
    if (bicepsPriority && !containsAny(context, "triceps") && containsAny(searchable, "triceps")) {
      return true;
    }

    return false;
  }

  private int exerciseScore(
      Exercise exercise, String context, List<String> priorityTerms, List<String> preferredEquipment) {
    int score = 0;
    String name = nullToEmpty(exercise.name()).toLowerCase(Locale.ROOT);
    String target = String.join(" ", emptyList(exercise.targetMuscles())).toLowerCase(Locale.ROOT);
    String secondary = String.join(" ", emptyList(exercise.secondaryMuscles())).toLowerCase(Locale.ROOT);
    String bodyParts = String.join(" ", emptyList(exercise.bodyParts())).toLowerCase(Locale.ROOT);
    String equipment = String.join(" ", emptyList(exercise.equipments())).toLowerCase(Locale.ROOT);
    String searchable = String.join(" ", name, target, secondary, bodyParts);

    for (String priorityTerm : emptyList(priorityTerms)) {
      String normalizedTerm = nullToEmpty(priorityTerm).toLowerCase(Locale.ROOT);
      if (normalizedTerm.length() > 2 && containsAny(searchable, normalizedTerm)) {
        score += isGenericPriorityTerm(normalizedTerm) ? 8 : 18;
      }
    }

    for (String token : context.split("\\s+")) {
      if (token.length() > 3 && containsAny(searchable, token)) {
        score += 4;
      }
    }
    if (containsAny(context, "acasa", "fara echipament", "bodyweight") && equipment.contains("body weight")) {
      score += 6;
    }
    if (containsAny(context, "gantere", "dumbbell") && equipment.contains("dumbbell")) {
      score += 6;
    }
    if (containsAny(context, "bara", "barbell") && equipment.contains("barbell")) {
      score += 6;
    }
    for (String preferred : emptyList(preferredEquipment)) {
      if (equipment.contains(preferred.toLowerCase(Locale.ROOT))) {
        score += 7;
      }
    }
    if (!name.contains("stretch")) {
      score += 1;
    }

    return score;
  }

  private int getSuggestedExerciseCount(ClientProfile profile) {
    if (profile != null && profile.getMaxSessionDuration() != null) {
      if (profile.getMaxSessionDuration() <= 45) {
        return 4;
      }
      if (profile.getMaxSessionDuration() >= 90) {
        return 6;
      }
    }

    return 5;
  }

  private int getSuggestedSets(ClientProfile profile) {
    String level = nullToEmpty(profile == null ? null : profile.getExperienceLevel()).toLowerCase(Locale.ROOT);
    if (level.contains("incepator")) {
      return 3;
    }
    if (level.contains("avansat")) {
      return 4;
    }
    return 3;
  }

  private int[] getSuggestedRepRange(String context, ClientProfile profile) {
    String goal = nullToEmpty(profile == null ? null : profile.getGoal()).toLowerCase(Locale.ROOT);
    String combined = context + " " + goal;

    if (containsAny(combined, "forta", "strength")) {
      return new int[] {4, 6};
    }
    if (containsAny(combined, "masa", "hipertrofie", "muscular")) {
      return new int[] {8, 12};
    }
    if (containsAny(combined, "slabire", "conditionare", "rezistenta", "cardio")) {
      return new int[] {12, 18};
    }

    return new int[] {8, 12};
  }

  private String buildGenerationRationale(
      ClientPlan plan,
      ClientProfile profile,
      String prompt,
      List<String> targetGroups,
      List<String> priorityTerms,
      int exerciseCount,
      int sets,
      int[] reps,
      int modelSamples) {
    List<String> reasons = new ArrayList<>();
    reasons.add("Focus plan: " + plan.getActiveFocus());
    if (profile != null && blankToNull(profile.getExperienceLevel()) != null) {
      reasons.add("nivel " + profile.getExperienceLevel());
    }
    if (profile != null && blankToNull(profile.getGoal()) != null) {
      reasons.add("obiectiv " + profile.getGoal());
    }
    if (prompt != null) {
      reasons.add("prompt antrenor: " + prompt);
    }

    return String.format(
        "%s. Model ML KNN antrenat pe %d exemple curatoriate, cu termeni prioritari %s. A ales %d exercitii pentru %s, %d serii x %d-%d repetari.",
        String.join(", ", reasons),
        modelSamples,
        priorityTerms == null || priorityTerms.isEmpty()
            ? "generali"
            : String.join(", ", priorityTerms),
        exerciseCount,
        String.join(", ", targetGroups),
        sets,
        reps[0],
        reps[1]);
  }

  private String buildGeneratedExerciseNotes(Exercise exercise, ClientProfile profile, String prompt) {
    List<String> notes = new ArrayList<>();
    notes.add("Propus automat din catalogul TET-FIT.");
    if (profile != null && blankToNull(profile.getRestrictions()) != null) {
      notes.add("Verifica restrictii: " + profile.getRestrictions());
    }
    if (prompt != null) {
      notes.add("Context antrenor: " + prompt);
    }
    if (!emptyList(exercise.equipments()).isEmpty()) {
      notes.add("Echipament: " + String.join(", ", exercise.equipments()));
    }
    return String.join(" ", notes);
  }

  private boolean containsAny(String value, String... needles) {
    String checked = normalizeSearchText(value);
    for (String needle : needles) {
      if (checked.contains(normalizeSearchText(needle))) {
        return true;
      }
    }
    return false;
  }

  private String normalizeSearchText(String value) {
    return Normalizer.normalize(nullToEmpty(value), Normalizer.Form.NFD)
        .replaceAll("\\p{M}", "")
        .toLowerCase(Locale.ROOT);
  }

  private List<String> emptyList(List<String> values) {
    return values == null ? List.of() : values;
  }

  private String nullToEmpty(String value) {
    return value == null ? "" : value;
  }

  private void validateNutritionTargetRequest(NutritionTargetRequest request) {
    if (request.calories() <= 0 || request.protein() <= 0 || request.fats() <= 0) {
      throw AuthException.badRequest("Caloriile, proteinele si grasimile trebuie sa fie pozitive.");
    }
    if (request.carbs() < 0) {
      throw AuthException.badRequest("Carbohidratii nu pot fi negativi.");
    }
  }

  private void validateClientProfileRequest(ClientProfileRequest request) {
    if (request.targetWeight() != null && request.targetWeight() <= 0) {
      throw AuthException.badRequest("Greutatea tinta trebuie sa fie pozitiva.");
    }
    if (request.targetDate() != null && request.targetDate().isBefore(LocalDate.now())) {
      throw AuthException.badRequest("Termenul tinta nu poate fi in trecut.");
    }
  }

  private void validateNutritionLogRequest(NutritionLogRequest request) {
    if (request.date().isAfter(LocalDate.now())) {
      throw AuthException.badRequest("Nu poti loga nutritia pentru o zi viitoare.");
    }
    if (request.calories() < 0
        || request.protein() < 0
        || request.carbs() < 0
        || request.fats() < 0) {
      throw AuthException.badRequest("Valorile nutritionale nu pot fi negative.");
    }
    if (request.weight() != null && request.weight() <= 0) {
      throw AuthException.badRequest("Greutatea trebuie sa fie pozitiva.");
    }
  }

  private NutritionSuggestionResponse buildNutritionSuggestion(ClientProfile profile) {
    requireCompleteNutritionProfile(profile);

    double weight = profile.getWeight();
    int height = profile.getHeight();
    int age = profile.getAge();
    double heightMeters = height / 100.0;
    double bmi = weight / (heightMeters * heightMeters);
    double bmr =
        isMale(profile.getSex())
            ? 10 * weight + 6.25 * height - 5 * age + 5
            : 10 * weight + 6.25 * height - 5 * age - 161;
    double activityFactor = getActivityFactor(profile.getLifestyle());
    double tdee = bmr * activityFactor;
    String goal = normalizeSearchText(profile.getGoal());

    int calories;
    int caloriesMin;
    int caloriesMax;
    String objective;

    if (goal.contains("slabire")) {
      calories = (int) Math.round(tdee - 400);
      caloriesMin = (int) Math.round(tdee - 500);
      caloriesMax = (int) Math.round(tdee - 300);
      objective = "Slabire";
    } else if (goal.contains("masa")) {
      calories = (int) Math.round(tdee + 325);
      caloriesMin = (int) Math.round(tdee + 250);
      caloriesMax = (int) Math.round(tdee + 400);
      objective = "Masa";
    } else {
      calories = (int) Math.round(tdee);
      caloriesMin = calories;
      caloriesMax = calories;
      objective = "Mentinere";
    }

    int proteinMin = (int) Math.round(weight * 1.6);
    int proteinMax = (int) Math.round(weight * 2.2);
    int protein = (int) Math.round(weight * 1.9);
    int fatsMin = (int) Math.round(weight * 0.7);
    int fatsMax = (int) Math.round(weight);
    int fats = (int) Math.round(weight * 0.85);
    int carbs = Math.max(0, (int) Math.round((calories - protein * 4 - fats * 9) / 4.0));
    Double targetWeight = profile.getTargetWeight() == null ? null : roundOneDecimal(profile.getTargetWeight());
    Double weightDelta = targetWeight == null ? null : roundOneDecimal(targetWeight - weight);
    Double weeklyWeightChange = calculateWeeklyWeightChange(profile, weightDelta);
    String targetPaceNote = buildTargetPaceNote(objective, weightDelta, weeklyWeightChange);

    return new NutritionSuggestionResponse(
        roundOneDecimal(bmi),
        roundOneDecimal(bmr),
        roundOneDecimal(tdee),
        activityFactor,
        objective,
        calories,
        caloriesMin,
        caloriesMax,
        protein,
        proteinMin,
        proteinMax,
        fats,
        fatsMin,
        fatsMax,
        carbs,
        targetWeight,
        profile.getTargetDate(),
        weightDelta,
        weeklyWeightChange,
        targetPaceNote,
        "BMI = kg / m2, BMR Mifflin-St Jeor, TDEE = BMR * factor activitate. "
            + "Proteine 1.6-2.2 g/kg, grasimi 0.7-1.0 g/kg, carbohidrati din caloriile ramase.");
  }

  private Double calculateWeeklyWeightChange(ClientProfile profile, Double weightDelta) {
    if (weightDelta == null || profile.getTargetDate() == null) {
      return null;
    }

    long daysUntilTarget = ChronoUnit.DAYS.between(LocalDate.now(), profile.getTargetDate());
    if (daysUntilTarget < 7) {
      return null;
    }

    return roundOneDecimal(weightDelta / (daysUntilTarget / 7.0));
  }

  private String buildTargetPaceNote(String objective, Double weightDelta, Double weeklyWeightChange) {
    if (weightDelta == null) {
      return null;
    }

    if (weeklyWeightChange == null) {
      return "Greutate tinta: " + formatSignedWeight(weightDelta) + " fata de greutatea curenta.";
    }

    double absoluteWeeklyChange = Math.abs(weeklyWeightChange);
    String paceQuality;
    if ("Slabire".equals(objective) && weeklyWeightChange < -1.0) {
      paceQuality = "ritm agresiv, merita ajustat cu antrenorul";
    } else if ("Masa".equals(objective) && weeklyWeightChange > 0.5) {
      paceQuality = "ritm agresiv pentru masa musculara curata";
    } else if (absoluteWeeklyChange < 0.2) {
      paceQuality = "ritm foarte conservator";
    } else {
      paceQuality = "ritm realist";
    }

    return "Greutate tinta: "
        + formatSignedWeight(weightDelta)
        + ", aproximativ "
        + formatSignedWeight(weeklyWeightChange)
        + "/saptamana, "
        + paceQuality
        + ".";
  }

  private String formatSignedWeight(double value) {
    String prefix = value > 0 ? "+" : "";
    return prefix + roundOneDecimal(value) + " kg";
  }

  private void requireCompleteNutritionProfile(ClientProfile profile) {
    if (profile.getAge() == null
        || profile.getHeight() == null
        || profile.getWeight() == null
        || blankToNull(profile.getSex()) == null
        || blankToNull(profile.getLifestyle()) == null
        || blankToNull(profile.getGoal()) == null) {
      throw AuthException.badRequest(
          "Clientul trebuie sa completeze varsta, inaltimea, greutatea, sexul, stilul de viata si obiectivul in Datele mele.");
    }

    if (profile.getAge() <= 0 || profile.getHeight() <= 0 || profile.getWeight() <= 0) {
      throw AuthException.badRequest("Datele clientului nu sunt valide pentru calculul nutritional.");
    }

    if (!isMale(profile.getSex()) && !isFemale(profile.getSex())) {
      throw AuthException.badRequest("Sexul trebuie sa fie masculin sau feminin pentru calculul BMR.");
    }
  }

  private double getActivityFactor(String lifestyle) {
    String normalized = normalizeSearchText(lifestyle);
    if (normalized.contains("sedentar") || normalized.contains("static")) {
      return 1.2;
    }
    if (normalized.contains("usor") || normalized.contains("light")) {
      return 1.375;
    }
    if (normalized.contains("moderat")) {
      return 1.55;
    }
    if (normalized.contains("intens") || normalized.contains("activ")) {
      return 1.725;
    }
    throw AuthException.badRequest("Stilul de viata trebuie sa fie sedentar, usor, moderat sau intens.");
  }

  private boolean isMale(String sex) {
    String normalized = normalizeSearchText(sex);
    return normalized.contains("masculin") || normalized.contains("barbat") || normalized.equals("male");
  }

  private boolean isFemale(String sex) {
    String normalized = normalizeSearchText(sex);
    return normalized.contains("feminin") || normalized.contains("femeie") || normalized.equals("female");
  }

  private double roundOneDecimal(double value) {
    return Math.round(value * 10.0) / 10.0;
  }

  private record WorkoutModelPrediction(
      List<String> targetGroups,
      List<String> priorityTerms,
      int sets,
      int minReps,
      int maxReps,
      int exerciseCount,
      List<String> avoidPatterns,
      List<String> preferredEquipment,
      int modelSamples) {}

  private record ModelNeighbor(JsonNode label, double weight, double distance) {}

  private String blankToNull(String value) {
    return value == null || value.trim().isBlank() ? null : value.trim();
  }

  private ClientProfileResponse toProfileResponse(ClientProfile profile) {
    return new ClientProfileResponse(
        profile.getId(),
        profile.getAge(),
        profile.getHeight(),
        profile.getWeight(),
        profile.getTargetWeight(),
        profile.getTargetDate(),
        profile.getSex(),
        profile.getLifestyle(),
        profile.getExperienceLevel(),
        profile.getGoal(),
        profile.getDaysPerWeek(),
        profile.getMaxSessionDuration(),
        profile.getRestrictions());
  }
}
