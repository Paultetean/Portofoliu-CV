package com.fitness.auth.training;

import com.fitness.auth.user.AppUser;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, UUID> {
  List<WorkoutLog> findByClientOrderByCreatedAtDesc(AppUser client);
}
