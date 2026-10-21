package com.fitness.auth.training;

import com.fitness.auth.user.AppUser;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyNutritionLogRepository extends JpaRepository<DailyNutritionLog, UUID> {
  List<DailyNutritionLog> findByClientOrderByLogDateAsc(AppUser client);

  Optional<DailyNutritionLog> findByClientAndLogDate(AppUser client, LocalDate logDate);
}
