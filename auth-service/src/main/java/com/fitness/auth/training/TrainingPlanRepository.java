package com.fitness.auth.training;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainingPlanRepository extends JpaRepository<TrainingPlan, UUID> {
  List<TrainingPlan> findByTrainerProfileOrderBySessionsAsc(TrainerProfile trainerProfile);

  List<TrainingPlan> findByTrainerProfile(TrainerProfile trainerProfile);
}
