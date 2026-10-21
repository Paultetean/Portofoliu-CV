package com.fitness.auth.config;

import com.fitness.auth.user.AppUser;
import com.fitness.auth.user.AppUserRepository;
import com.fitness.auth.user.UserRole;
import com.fitness.auth.training.TrainerProfile;
import com.fitness.auth.training.TrainerProfileRepository;
import com.fitness.auth.training.TrainingPlan;
import com.fitness.auth.training.TrainingPlanRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SeedDataConfig {
  @Bean
  CommandLineRunner seedTrainerAccount(
      AppUserRepository userRepository,
      PasswordEncoder passwordEncoder,
      TrainerProfileRepository trainerProfileRepository,
      TrainingPlanRepository trainingPlanRepository) {
    return args -> {
      userRepository
          .findByUsernameIgnoreCase("super.admin")
          .orElseGet(
              () ->
                  userRepository.save(
                      new AppUser(
                          "Super Admin",
                          "super.admin",
                          "super.admin@tetfit.local",
                          passwordEncoder.encode("Admin123!"),
                          UserRole.SUPER_ADMIN)));

      AppUser paul =
          userRepository
              .findByUsernameIgnoreCase("paul.trainer")
              .orElseGet(
                  () ->
                      userRepository.save(
                          new AppUser(
                              "Paul Tetean",
                              "paul.trainer",
                              "paul.trainer@tetfit.local",
                              passwordEncoder.encode("Trainer123!"),
                              UserRole.TRAINER)));
      if (paul.getRole() != UserRole.TRAINER) {
        paul.setRole(UserRole.TRAINER);
        userRepository.save(paul);
      }

      TrainerProfile paulProfile =
          trainerProfileRepository
              .findByUser(paul)
              .orElseGet(
                  () ->
                      trainerProfileRepository.save(
                          new TrainerProfile(
                              paul,
                              "Paul Tetean",
                              "Antrenor personal",
                              "Planuri de forta, masa musculara si recompozitie corporala, cu monitorizare lunara si ajustari in functie de progres.")));

      seedPlanIfMissing(trainingPlanRepository, paulProfile, 3, 300, "Forta si tehnica de baza");
      seedPlanIfMissing(
          trainingPlanRepository, paulProfile, 4, 350, "Hipertrofie si recompozitie corporala");
      seedPlanIfMissing(
          trainingPlanRepository, paulProfile, 5, 450, "Performanta, forta si conditionare");

      AppUser catalina =
          userRepository
              .findByUsernameIgnoreCase("catalina.trainer")
              .orElseGet(
                  () ->
                      userRepository.save(
                          new AppUser(
                              "Catalina Buzan",
                              "catalina.trainer",
                              "catalina.trainer@tetfit.local",
                              passwordEncoder.encode("Trainer123!"),
                              UserRole.TRAINER)));
      if (catalina.getRole() != UserRole.TRAINER) {
        catalina.setRole(UserRole.TRAINER);
        userRepository.save(catalina);
      }

      TrainerProfile catalinaProfile =
          trainerProfileRepository
              .findByUser(catalina)
              .orElseGet(
                  () ->
                      trainerProfileRepository.save(
                          new TrainerProfile(
                              catalina,
                              "Catalina Buzan",
                              "Antrenor pentru femei",
                              "Specializata in antrenamente pentru femei, slabire si recompozitie corporala, cu programe adaptate nivelului de experienta si obiectivelor personale.")));

      seedPlanIfMissing(
          trainingPlanRepository, catalinaProfile, 3, 300, "Tonifiere si slabire progresiva");
      seedPlanIfMissing(trainingPlanRepository, catalinaProfile, 4, 350, "Recompozitie si mobilitate");
      seedPlanIfMissing(
          trainingPlanRepository, catalinaProfile, 5, 450, "Program intensiv cu monitorizare");
    };
  }

  private void seedPlanIfMissing(
      TrainingPlanRepository repository, TrainerProfile trainerProfile, int sessions, int price, String focus) {
    boolean exists =
        repository.findByTrainerProfileOrderBySessionsAsc(trainerProfile).stream()
            .anyMatch(plan -> plan.getSessions() == sessions);

    if (!exists) {
      repository.save(new TrainingPlan(trainerProfile, sessions, price, focus));
    }
  }
}
