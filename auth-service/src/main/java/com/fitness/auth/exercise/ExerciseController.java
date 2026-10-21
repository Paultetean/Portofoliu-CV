package com.fitness.auth.exercise;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {
  private final ExerciseService exerciseService;

  public ExerciseController(ExerciseService exerciseService) {
    this.exerciseService = exerciseService;
  }

  @GetMapping
  public List<Exercise> getExercises() {
    return exerciseService.getAllExercises();
  }

  @GetMapping("/{exerciseId}/image")
  public ResponseEntity<byte[]> getExerciseImage(@PathVariable String exerciseId) {
    return exerciseService.getExerciseImage(exerciseId);
  }

  @GetMapping("/debug")
  public String debugExercises() {
    return exerciseService.debugFirstPage();
  }

  @PostMapping("/refresh")
  public List<Exercise> refreshExercises() {
    return exerciseService.refreshExerciseCatalog();
  }
}
