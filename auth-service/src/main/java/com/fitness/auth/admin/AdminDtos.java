package com.fitness.auth.admin;

import com.fitness.auth.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class AdminDtos {
  private AdminDtos() {}

  public record AdminSummaryResponse(
      long totalUsers,
      long activeUsers,
      long clients,
      long trainers,
      long inactiveUsers,
      int totalRevenue) {}

  public record AdminUserResponse(
      UUID id,
      String fullName,
      String username,
      String email,
      UserRole role,
      boolean active,
      Instant createdAt) {}

  public record AdminPlanRequest(
      @NotNull Integer sessions, @NotNull Integer price, @NotBlank String focus) {}

  public record CreateTrainerRequest(
      @NotBlank String fullName,
      @NotBlank String username,
      @Email @NotBlank String email,
      @NotBlank @Size(min = 8, max = 120) String password,
      @NotBlank String roleTitle,
      @NotBlank String description,
      List<AdminPlanRequest> plans) {}

  public record UpdateUserStatusRequest(@NotNull Boolean active) {}

  public record AdminChatMessageResponse(
      UUID id,
      UUID clientId,
      String clientName,
      String trainerName,
      UUID senderId,
      String senderName,
      UserRole senderRole,
      String text,
      Instant createdAt) {}

  public record AdminChatConversationResponse(
      String id,
      UUID clientId,
      String clientName,
      UUID trainerProfileId,
      String trainerName,
      int messageCount,
      String latestMessage,
      Instant lastMessageAt,
      List<AdminChatMessageResponse> messages) {}

  public record AdminPaymentResponse(
      UUID id,
      UUID clientId,
      String clientName,
      String trainerName,
      int sessions,
      int amount,
      String focus,
      Instant paidAt) {}

  public record AdminTrainerRevenueResponse(
      String trainerName, int totalRevenue, long paymentsCount) {}

  public record AdminPaymentHistoryResponse(
      LocalDate until,
      int totalRevenue,
      List<AdminTrainerRevenueResponse> trainerRevenues,
      List<AdminPaymentResponse> payments) {}

  public record AdminAuditLogResponse(
      UUID id,
      UUID actorId,
      String actorName,
      String actorUsername,
      UUID targetId,
      String targetName,
      String targetUsername,
      UserRole targetRole,
      AdminAuditAction action,
      String details,
      Instant createdAt) {}
}
