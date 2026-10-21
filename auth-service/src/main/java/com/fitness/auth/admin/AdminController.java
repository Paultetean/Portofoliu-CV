package com.fitness.auth.admin;

import com.fitness.auth.admin.AdminDtos.AdminChatConversationResponse;
import com.fitness.auth.admin.AdminDtos.AdminAuditLogResponse;
import com.fitness.auth.admin.AdminDtos.AdminPaymentHistoryResponse;
import com.fitness.auth.admin.AdminDtos.AdminSummaryResponse;
import com.fitness.auth.admin.AdminDtos.AdminUserResponse;
import com.fitness.auth.admin.AdminDtos.CreateTrainerRequest;
import com.fitness.auth.admin.AdminDtos.UpdateUserStatusRequest;
import com.fitness.auth.security.CurrentUserService;
import com.fitness.auth.user.AppUser;
import com.fitness.auth.user.UserRole;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
  private final AdminService adminService;
  private final CurrentUserService currentUserService;

  public AdminController(AdminService adminService, CurrentUserService currentUserService) {
    this.adminService = adminService;
    this.currentUserService = currentUserService;
  }

  @GetMapping("/summary")
  public AdminSummaryResponse getSummary(@RequestHeader("Authorization") String authorization) {
    requireSuperAdmin(authorization);
    return adminService.getSummary();
  }

  @GetMapping("/users")
  public List<AdminUserResponse> getUsers(@RequestHeader("Authorization") String authorization) {
    requireSuperAdmin(authorization);
    return adminService.getUsers();
  }

  @PostMapping("/trainers")
  public AdminUserResponse createTrainer(
      @RequestHeader("Authorization") String authorization,
      @Valid @RequestBody CreateTrainerRequest request) {
    AppUser admin = requireSuperAdmin(authorization);
    return adminService.createTrainer(admin, request);
  }

  @PatchMapping("/users/{userId}/status")
  public AdminUserResponse updateUserStatus(
      @RequestHeader("Authorization") String authorization,
      @PathVariable UUID userId,
      @Valid @RequestBody UpdateUserStatusRequest request) {
    AppUser admin = requireSuperAdmin(authorization);
    return adminService.updateUserStatus(admin, userId, request);
  }

  @DeleteMapping("/users/{userId}")
  public AdminUserResponse deleteUser(
      @RequestHeader("Authorization") String authorization, @PathVariable UUID userId) {
    AppUser admin = requireSuperAdmin(authorization);
    return adminService.deleteUser(admin, userId);
  }

  @GetMapping("/chats")
  public List<AdminChatConversationResponse> getChats(
      @RequestHeader("Authorization") String authorization) {
    requireSuperAdmin(authorization);
    return adminService.getChats();
  }

  @GetMapping("/payments")
  public AdminPaymentHistoryResponse getPayments(
      @RequestHeader("Authorization") String authorization,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate until) {
    requireSuperAdmin(authorization);
    return adminService.getPaymentHistory(until);
  }

  @GetMapping("/audit-logs")
  public List<AdminAuditLogResponse> getAuditLogs(
      @RequestHeader("Authorization") String authorization) {
    requireSuperAdmin(authorization);
    return adminService.getAuditLogs();
  }

  private AppUser requireSuperAdmin(String authorization) {
    return currentUserService.requireRole(authorization, UserRole.SUPER_ADMIN);
  }
}
