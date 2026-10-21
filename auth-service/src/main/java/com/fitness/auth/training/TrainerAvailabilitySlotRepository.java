package com.fitness.auth.training;

import com.fitness.auth.user.AppUser;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainerAvailabilitySlotRepository
    extends JpaRepository<TrainerAvailabilitySlot, UUID> {
  List<TrainerAvailabilitySlot> findByTrainerProfileOrderByScheduledAtDesc(
      TrainerProfile trainerProfile);

  List<TrainerAvailabilitySlot>
      findByTrainerProfileAndClientIsNullAndScheduledAtAfterOrderByScheduledAtAsc(
          TrainerProfile trainerProfile, LocalDateTime scheduledAt);

  List<TrainerAvailabilitySlot> findByTrainerProfileAndScheduledAtAfterOrderByScheduledAtAsc(
      TrainerProfile trainerProfile, LocalDateTime scheduledAt);

  List<TrainerAvailabilitySlot> findByClientOrderByScheduledAtDesc(AppUser client);

  Optional<TrainerAvailabilitySlot> findByIdAndTrainerProfile(UUID id, TrainerProfile trainerProfile);

  boolean existsByTrainerProfileAndScheduledAt(
      TrainerProfile trainerProfile, LocalDateTime scheduledAt);
}
