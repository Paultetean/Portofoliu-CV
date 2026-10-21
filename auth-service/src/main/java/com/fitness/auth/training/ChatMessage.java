package com.fitness.auth.training;

import com.fitness.auth.user.AppUser;
import com.fitness.auth.user.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "client_id", nullable = false)
  private AppUser client;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "trainer_profile_id", nullable = false)
  private TrainerProfile trainerProfile;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "sender_id", nullable = false)
  private AppUser sender;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private UserRole senderRole;

  @Column(nullable = false, length = 2000)
  private String text;

  @Column(nullable = false)
  private Instant createdAt = Instant.now();

  protected ChatMessage() {}

  public ChatMessage(AppUser client, TrainerProfile trainerProfile, AppUser sender, String text) {
    this.client = client;
    this.trainerProfile = trainerProfile;
    this.sender = sender;
    this.senderRole = sender.getRole();
    this.text = text;
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

  public AppUser getSender() {
    return sender;
  }

  public UserRole getSenderRole() {
    return senderRole;
  }

  public String getText() {
    return text;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
