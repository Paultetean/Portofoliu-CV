package com.fitness.auth.admin;

import com.fitness.auth.admin.AdminDtos.AdminChatMessageResponse;
import com.fitness.auth.admin.AdminDtos.AdminChatConversationResponse;
import com.fitness.auth.admin.AdminDtos.AdminAuditLogResponse;
import com.fitness.auth.admin.AdminDtos.AdminPaymentHistoryResponse;
import com.fitness.auth.admin.AdminDtos.AdminPaymentResponse;
import com.fitness.auth.admin.AdminDtos.AdminPlanRequest;
import com.fitness.auth.admin.AdminDtos.AdminSummaryResponse;
import com.fitness.auth.admin.AdminDtos.AdminTrainerRevenueResponse;
import com.fitness.auth.admin.AdminDtos.AdminUserResponse;
import com.fitness.auth.admin.AdminDtos.CreateTrainerRequest;
import com.fitness.auth.admin.AdminDtos.UpdateUserStatusRequest;
import com.fitness.auth.service.AuthException;
import com.fitness.auth.training.AssignedExerciseRepository;
import com.fitness.auth.training.ChatMessage;
import com.fitness.auth.training.ChatMessageRepository;
import com.fitness.auth.training.ClientProfileRepository;
import com.fitness.auth.training.ClientPlan;
import com.fitness.auth.training.ClientPlanRepository;
import com.fitness.auth.training.DailyNutritionLogRepository;
import com.fitness.auth.training.NutritionTargetRepository;
import com.fitness.auth.training.TrainerAvailabilitySlot;
import com.fitness.auth.training.TrainerAvailabilitySlotRepository;
import com.fitness.auth.training.TrainerProfile;
import com.fitness.auth.training.TrainerProfileRepository;
import com.fitness.auth.training.TrainingAppointmentRepository;
import com.fitness.auth.training.TrainingPlan;
import com.fitness.auth.training.TrainingPlanRepository;
import com.fitness.auth.training.WorkoutLogRepository;
import com.fitness.auth.user.AppUser;
import com.fitness.auth.user.AppUserRepository;
import com.fitness.auth.user.UserRole;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {
  private final AppUserRepository userRepository;
  private final TrainerProfileRepository trainerProfileRepository;
  private final TrainingPlanRepository trainingPlanRepository;
  private final ClientPlanRepository clientPlanRepository;
  private final ChatMessageRepository chatMessageRepository;
  private final AssignedExerciseRepository assignedExerciseRepository;
  private final TrainingAppointmentRepository trainingAppointmentRepository;
  private final TrainerAvailabilitySlotRepository trainerAvailabilitySlotRepository;
  private final WorkoutLogRepository workoutLogRepository;
  private final ClientProfileRepository clientProfileRepository;
  private final NutritionTargetRepository nutritionTargetRepository;
  private final DailyNutritionLogRepository dailyNutritionLogRepository;
  private final AdminAuditLogRepository adminAuditLogRepository;
  private final PasswordEncoder passwordEncoder;

  public AdminService(
      AppUserRepository userRepository,
      TrainerProfileRepository trainerProfileRepository,
      TrainingPlanRepository trainingPlanRepository,
      ClientPlanRepository clientPlanRepository,
      ChatMessageRepository chatMessageRepository,
      AssignedExerciseRepository assignedExerciseRepository,
      TrainingAppointmentRepository trainingAppointmentRepository,
      TrainerAvailabilitySlotRepository trainerAvailabilitySlotRepository,
      WorkoutLogRepository workoutLogRepository,
      ClientProfileRepository clientProfileRepository,
      NutritionTargetRepository nutritionTargetRepository,
      DailyNutritionLogRepository dailyNutritionLogRepository,
      AdminAuditLogRepository adminAuditLogRepository,
      PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.trainerProfileRepository = trainerProfileRepository;
    this.trainingPlanRepository = trainingPlanRepository;
    this.clientPlanRepository = clientPlanRepository;
    this.chatMessageRepository = chatMessageRepository;
    this.assignedExerciseRepository = assignedExerciseRepository;
    this.trainingAppointmentRepository = trainingAppointmentRepository;
    this.trainerAvailabilitySlotRepository = trainerAvailabilitySlotRepository;
    this.workoutLogRepository = workoutLogRepository;
    this.clientProfileRepository = clientProfileRepository;
    this.nutritionTargetRepository = nutritionTargetRepository;
    this.dailyNutritionLogRepository = dailyNutritionLogRepository;
    this.adminAuditLogRepository = adminAuditLogRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional(readOnly = true)
  public AdminSummaryResponse getSummary() {
    List<AppUser> users = userRepository.findAll();
    List<ClientPlan> payments = clientPlanRepository.findAll();
    int totalRevenue =
        payments.stream().mapToInt(plan -> plan.getTrainingPlan().getPrice()).sum();

    return new AdminSummaryResponse(
        users.size(),
        users.stream().filter(AppUser::isActive).count(),
        users.stream().filter(user -> user.getRole() == UserRole.CLIENT).count(),
        users.stream().filter(user -> user.getRole() == UserRole.TRAINER).count(),
        users.stream().filter(user -> !user.isActive()).count(),
        totalRevenue);
  }

  @Transactional(readOnly = true)
  public List<AdminUserResponse> getUsers() {
    return userRepository.findAll().stream()
        .sorted(Comparator.comparing(AppUser::getCreatedAt).reversed())
        .map(this::toUserResponse)
        .toList();
  }

  @Transactional
  public AdminUserResponse createTrainer(AppUser admin, CreateTrainerRequest request) {
    String username = request.username().trim();
    String email = request.email().trim().toLowerCase();

    if (userRepository.existsByUsernameIgnoreCase(username)) {
      throw AuthException.badRequest("Username-ul este deja folosit.");
    }
    if (userRepository.existsByEmailIgnoreCase(email)) {
      throw AuthException.badRequest("Emailul este deja folosit.");
    }

    AppUser trainer =
        userRepository.save(
            new AppUser(
                request.fullName().trim(),
                username,
                email,
                passwordEncoder.encode(request.password()),
                UserRole.TRAINER));
    TrainerProfile profile =
        trainerProfileRepository.save(
            new TrainerProfile(
                trainer,
                request.fullName().trim(),
                request.roleTitle().trim(),
                request.description().trim()));
    List<AdminPlanRequest> plans =
        request.plans() == null || request.plans().isEmpty()
            ? List.of(
                new AdminPlanRequest(3, 300, "Forta si tehnica de baza"),
                new AdminPlanRequest(4, 350, "Hipertrofie si recompozitie corporala"),
                new AdminPlanRequest(5, 450, "Performanta, forta si conditionare"))
            : request.plans();

    for (AdminPlanRequest plan : plans) {
      trainingPlanRepository.save(
          new TrainingPlan(profile, plan.sessions(), plan.price(), plan.focus().trim()));
    }

    saveAuditLog(
        admin,
        trainer,
        AdminAuditAction.CREATE_TRAINER,
        "A creat contul de antrenor cu "
            + plans.size()
            + (plans.size() == 1 ? " pachet tarifar." : " pachete tarifare."));

    return toUserResponse(trainer);
  }

  @Transactional
  public AdminUserResponse updateUserStatus(
      AppUser admin, UUID userId, UpdateUserStatusRequest request) {
    AppUser user = requireManagedUser(userId);

    if (admin.getId().equals(user.getId())) {
      throw AuthException.badRequest("Nu iti poti dezactiva propriul cont de super-admin.");
    }

    user.setActive(request.active());
    AdminUserResponse response = toUserResponse(userRepository.save(user));
    saveAuditLog(
        admin,
        user,
        request.active() ? AdminAuditAction.ACTIVATE_ACCOUNT : AdminAuditAction.DEACTIVATE_ACCOUNT,
        request.active() ? "A activat contul." : "A dezactivat contul.");
    return response;
  }

  @Transactional
  public AdminUserResponse deleteUser(AppUser admin, UUID userId) {
    AppUser user = requireManagedUser(userId);

    if (admin.getId().equals(user.getId())) {
      throw AuthException.badRequest("Nu iti poti sterge propriul cont de super-admin.");
    }

    AdminUserResponse deletedUser = toUserResponse(user);
    saveAuditLog(
        admin,
        user,
        AdminAuditAction.DELETE_ACCOUNT,
        "A sters definitiv contul si datele operationale dependente.");

    if (user.getRole() == UserRole.CLIENT) {
      deleteClientDependencies(user);
    } else if (user.getRole() == UserRole.TRAINER) {
      deleteTrainerDependencies(user);
    } else {
      deleteMessagesForUser(user);
    }

    userRepository.delete(user);
    return deletedUser;
  }

  @Transactional(readOnly = true)
  public List<AdminChatConversationResponse> getChats() {
    return chatMessageRepository.findAll().stream()
        .collect(
            Collectors.groupingBy(
                message ->
                    message.getClient().getId()
                        + ":"
                        + message.getTrainerProfile().getId(),
                LinkedHashMap::new,
                Collectors.toList()))
        .values()
        .stream()
        .map(this::toChatConversationResponse)
        .sorted(Comparator.comparing(AdminChatConversationResponse::lastMessageAt).reversed())
        .toList();
  }

  @Transactional(readOnly = true)
  public AdminPaymentHistoryResponse getPaymentHistory(LocalDate until) {
    LocalDate selectedUntil = until == null ? LocalDate.now() : until;
    List<AdminPaymentResponse> payments =
        clientPlanRepository.findAll().stream()
            .filter(
                plan ->
                    !plan
                        .getSelectedAt()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate()
                        .isAfter(selectedUntil))
            .sorted(Comparator.comparing(ClientPlan::getSelectedAt).reversed())
            .map(this::toPaymentResponse)
            .toList();
    int totalRevenue = payments.stream().mapToInt(AdminPaymentResponse::amount).sum();
    List<AdminTrainerRevenueResponse> trainerRevenues = getTrainerRevenues(payments);

    return new AdminPaymentHistoryResponse(selectedUntil, totalRevenue, trainerRevenues, payments);
  }

  @Transactional(readOnly = true)
  public List<AdminAuditLogResponse> getAuditLogs() {
    return adminAuditLogRepository.findTop120ByOrderByCreatedAtDesc().stream()
        .map(this::toAuditLogResponse)
        .toList();
  }

  private void saveAuditLog(
      AppUser admin, AppUser target, AdminAuditAction action, String details) {
    adminAuditLogRepository.save(new AdminAuditLog(admin, target, action, details));
  }

  private void deleteClientDependencies(AppUser client) {
    deleteMessagesForUser(client);
    assignedExerciseRepository.deleteAll(
        assignedExerciseRepository.findByClientOrderByAssignedAtDesc(client));
    trainingAppointmentRepository.deleteAll(
        trainingAppointmentRepository.findByClientOrderByScheduledAtDesc(client));

    List<TrainerAvailabilitySlot> bookedSlots =
        trainerAvailabilitySlotRepository.findByClientOrderByScheduledAtDesc(client);
    bookedSlots.forEach(TrainerAvailabilitySlot::clearBooking);
    trainerAvailabilitySlotRepository.saveAll(bookedSlots);

    workoutLogRepository.deleteAll(workoutLogRepository.findByClientOrderByCreatedAtDesc(client));
    dailyNutritionLogRepository.deleteAll(
        dailyNutritionLogRepository.findByClientOrderByLogDateAsc(client));
    nutritionTargetRepository.findByClient(client).ifPresent(nutritionTargetRepository::delete);
    clientProfileRepository.findByClient(client).ifPresent(clientProfileRepository::delete);
    clientPlanRepository.findByClient(client).ifPresent(clientPlanRepository::delete);
  }

  private void deleteTrainerDependencies(AppUser trainer) {
    trainerProfileRepository
        .findByUser(trainer)
        .ifPresent(
            trainerProfile -> {
              deleteMessagesForTrainerProfile(trainerProfile);
              deleteMessagesForUser(trainer);
              assignedExerciseRepository.deleteAll(
                  assignedExerciseRepository.findByTrainerProfile(trainerProfile));
              trainingAppointmentRepository.deleteAll(
                  trainingAppointmentRepository.findByTrainerProfile(trainerProfile));
              trainerAvailabilitySlotRepository.deleteAll(
                  trainerAvailabilitySlotRepository.findByTrainerProfileOrderByScheduledAtDesc(
                      trainerProfile));
              nutritionTargetRepository.deleteAll(
                  nutritionTargetRepository.findByTrainerProfile(trainerProfile));
              clientPlanRepository.deleteAll(
                  clientPlanRepository.findByTrainingPlanTrainerProfile(trainerProfile));
              trainingPlanRepository.deleteAll(
                  trainingPlanRepository.findByTrainerProfile(trainerProfile));
              trainerProfileRepository.delete(trainerProfile);
            });
  }

  private void deleteMessagesForUser(AppUser user) {
    List<ChatMessage> messages =
        chatMessageRepository.findAll().stream()
            .filter(
                message ->
                    message.getClient().getId().equals(user.getId())
                        || message.getSender().getId().equals(user.getId()))
            .toList();
    chatMessageRepository.deleteAll(messages);
  }

  private void deleteMessagesForTrainerProfile(TrainerProfile trainerProfile) {
    List<ChatMessage> messages =
        chatMessageRepository.findAll().stream()
            .filter(
                message ->
                    message.getTrainerProfile().getId().equals(trainerProfile.getId()))
            .toList();
    chatMessageRepository.deleteAll(messages);
  }

  private List<AdminTrainerRevenueResponse> getTrainerRevenues(
      List<AdminPaymentResponse> payments) {
    Map<String, int[]> revenueByTrainer = new LinkedHashMap<>();

    for (AdminPaymentResponse payment : payments) {
      int[] totals = revenueByTrainer.computeIfAbsent(payment.trainerName(), key -> new int[2]);
      totals[0] += payment.amount();
      totals[1] += 1;
    }

    return revenueByTrainer.entrySet().stream()
        .map(
            entry ->
                new AdminTrainerRevenueResponse(
                    entry.getKey(), entry.getValue()[0], entry.getValue()[1]))
        .sorted(Comparator.comparing(AdminTrainerRevenueResponse::totalRevenue).reversed())
        .toList();
  }

  private AppUser requireManagedUser(UUID userId) {
    return userRepository
        .findById(userId)
        .orElseThrow(() -> AuthException.notFound("Utilizatorul nu exista."));
  }

  private AdminUserResponse toUserResponse(AppUser user) {
    return new AdminUserResponse(
        user.getId(),
        user.getFullName(),
        user.getUsername(),
        user.getEmail(),
        user.getRole(),
        user.isActive(),
        user.getCreatedAt());
  }

  private AdminChatMessageResponse toChatMessageResponse(ChatMessage message) {
    return new AdminChatMessageResponse(
        message.getId(),
        message.getClient().getId(),
        message.getClient().getFullName(),
        message.getTrainerProfile().getDisplayName(),
        message.getSender().getId(),
        message.getSender().getFullName(),
        message.getSenderRole(),
        message.getText(),
        message.getCreatedAt());
  }

  private AdminChatConversationResponse toChatConversationResponse(List<ChatMessage> messages) {
    List<AdminChatMessageResponse> sortedMessages =
        messages.stream()
            .sorted(Comparator.comparing(ChatMessage::getCreatedAt))
            .map(this::toChatMessageResponse)
            .toList();
    ChatMessage firstMessage = messages.get(0);
    AdminChatMessageResponse latestMessage = sortedMessages.get(sortedMessages.size() - 1);

    return new AdminChatConversationResponse(
        firstMessage.getClient().getId() + ":" + firstMessage.getTrainerProfile().getId(),
        firstMessage.getClient().getId(),
        firstMessage.getClient().getFullName(),
        firstMessage.getTrainerProfile().getId(),
        firstMessage.getTrainerProfile().getDisplayName(),
        sortedMessages.size(),
        latestMessage.text(),
        latestMessage.createdAt(),
        sortedMessages);
  }

  private AdminPaymentResponse toPaymentResponse(ClientPlan plan) {
    TrainingPlan trainingPlan = plan.getTrainingPlan();
    TrainerProfile trainerProfile = trainingPlan.getTrainerProfile();

    return new AdminPaymentResponse(
        plan.getId(),
        plan.getClient().getId(),
        plan.getClient().getFullName(),
        trainerProfile.getDisplayName(),
        trainingPlan.getSessions(),
        trainingPlan.getPrice(),
        plan.getActiveFocus(),
        plan.getSelectedAt());
  }

  private AdminAuditLogResponse toAuditLogResponse(AdminAuditLog log) {
    return new AdminAuditLogResponse(
        log.getId(),
        log.getActorId(),
        log.getActorName(),
        log.getActorUsername(),
        log.getTargetId(),
        log.getTargetName(),
        log.getTargetUsername(),
        log.getTargetRole(),
        log.getAction(),
        log.getDetails(),
        log.getCreatedAt());
  }
}
