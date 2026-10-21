package com.fitness.auth.training;

import com.fitness.auth.user.AppUser;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainingAppointmentRepository extends JpaRepository<TrainingAppointment, UUID> {
  List<TrainingAppointment> findByClientOrderByScheduledAtDesc(AppUser client);

  List<TrainingAppointment> findByTrainerProfileOrderByScheduledAtDesc(TrainerProfile trainerProfile);

  List<TrainingAppointment> findByTrainerProfile(TrainerProfile trainerProfile);
}
