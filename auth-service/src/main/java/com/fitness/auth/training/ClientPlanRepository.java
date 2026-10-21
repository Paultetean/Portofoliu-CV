package com.fitness.auth.training;

import com.fitness.auth.user.AppUser;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientPlanRepository extends JpaRepository<ClientPlan, UUID> {
  Optional<ClientPlan> findByClient(AppUser client);

  List<ClientPlan> findByTrainingPlanTrainerProfile(TrainerProfile trainerProfile);
}
