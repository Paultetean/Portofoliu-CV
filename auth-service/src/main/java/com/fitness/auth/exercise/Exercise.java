package com.fitness.auth.exercise;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record Exercise(
    String exerciseId,
    String name,
    String gifUrl,
    List<String> bodyParts,
    List<String> equipments,
    List<String> targetMuscles,
    List<String> secondaryMuscles,
    List<String> instructions) {}
