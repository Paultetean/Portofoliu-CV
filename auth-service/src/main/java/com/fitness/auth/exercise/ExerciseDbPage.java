package com.fitness.auth.exercise;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ExerciseDbPage(boolean success, Meta meta, List<Exercise> data) {
  @JsonIgnoreProperties(ignoreUnknown = true)
  public record Meta(int total, boolean hasNextPage, String nextCursor) {}
}
