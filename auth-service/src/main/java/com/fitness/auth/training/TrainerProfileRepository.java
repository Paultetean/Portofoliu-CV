package com.fitness.auth.training;

import com.fitness.auth.user.AppUser;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainerProfileRepository extends JpaRepository<TrainerProfile, UUID> {
  Optional<TrainerProfile> findByUser(AppUser user);

  boolean existsByUser(AppUser user);
}
