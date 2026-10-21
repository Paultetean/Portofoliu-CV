package com.fitness.auth.training;

import com.fitness.auth.user.AppUser;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignedExerciseRepository extends JpaRepository<AssignedExercise, UUID> {
  List<AssignedExercise> findByClientOrderByAssignedAtDesc(AppUser client);

  List<AssignedExercise> findByClientAndTrainerProfileOrderByAssignedAtDesc(
      AppUser client, TrainerProfile trainerProfile);

  List<AssignedExercise> findByTrainerProfile(TrainerProfile trainerProfile);

  Optional<AssignedExercise> findByIdAndClient(UUID id, AppUser client);

  Optional<AssignedExercise> findByIdAndTrainerProfile(UUID id, TrainerProfile trainerProfile);
}
