package com.fitness.auth.training;

import com.fitness.auth.user.AppUser;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
  List<ChatMessage> findByClientAndTrainerProfileOrderByCreatedAtAsc(
      AppUser client, TrainerProfile trainerProfile);
}
