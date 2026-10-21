package com.fitness.auth.exercise;

import java.time.Duration;
import java.time.Instant;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ExerciseService {
  private static final String EXERCISE_DB_URL = "https://oss.exercisedb.dev/api/v1/exercises";
  private static final String EXERCISE_DB_IMAGE_URL = "https://exercisedb.p.rapidapi.com/image";
  private static final Duration CACHE_TTL = Duration.ofHours(6);

  private final RestClient restClient;
  private final ExerciseRepository exerciseRepository;
  private final String rapidApiKey;
  private List<Exercise> cachedExercises = List.of();
  private Instant cacheExpiresAt = Instant.EPOCH;

  public ExerciseService(
      RestClient.Builder restClientBuilder,
      ExerciseRepository exerciseRepository,
      @Value("${app.exercise-db.rapidapi-key:}") String rapidApiKey) {
    this.exerciseRepository = exerciseRepository;
    this.rapidApiKey = rapidApiKey == null ? "" : rapidApiKey.trim();
    this.restClient =
        restClientBuilder
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .defaultHeader(
                HttpHeaders.USER_AGENT,
                "Mozilla/5.0 TET-FIT/0.1 (+http://localhost)")
            .build();
  }

  @Transactional(readOnly = true)
  public synchronized List<Exercise> getAllExercises() {
    if (Instant.now().isBefore(cacheExpiresAt) && !cachedExercises.isEmpty()) {
      return cachedExercises;
    }

    List<ExerciseEntity> storedExercises = exerciseRepository.findAll();

    if (!storedExercises.isEmpty()) {
      cachedExercises = storedExercises.stream().map(ExerciseEntity::toResponse).toList();
      cacheExpiresAt = Instant.now().plus(CACHE_TTL);
      return cachedExercises;
    }

    List<Exercise> exercises = fetchAllExercisesFromApi();
    exerciseRepository.saveAll(exercises.stream().map(ExerciseEntity::new).toList());
    cachedExercises = List.copyOf(exercises);
    cacheExpiresAt = Instant.now().plus(CACHE_TTL);
    return cachedExercises;
  }

  @Transactional
  public synchronized List<Exercise> refreshExerciseCatalog() {
    List<Exercise> exercises = fetchAllExercisesFromApi();
    exerciseRepository.deleteAllInBatch();
    exerciseRepository.saveAll(exercises.stream().map(ExerciseEntity::new).toList());
    cachedExercises = List.copyOf(exercises);
    cacheExpiresAt = Instant.now().plus(CACHE_TTL);
    return cachedExercises;
  }

  public ResponseEntity<byte[]> getExerciseImage(String exerciseId) {
    if (rapidApiKey.isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.NOT_FOUND, "Nu exista o cheie configurata pentru imaginile ExerciseDB.");
    }

    String encodedExerciseId = URLEncoder.encode(exerciseId, StandardCharsets.UTF_8);
    String imageUrl = EXERCISE_DB_IMAGE_URL + "?exerciseId=" + encodedExerciseId + "&resolution=360";

    try {
      ResponseEntity<byte[]> response =
          restClient
              .get()
              .uri(URI.create(imageUrl))
              .accept(MediaType.parseMediaType("image/gif"))
              .header("X-RapidAPI-Key", rapidApiKey)
              .header("X-RapidAPI-Host", "exercisedb.p.rapidapi.com")
              .retrieve()
              .toEntity(byte[].class);

      if (response.getBody() == null || response.getBody().length == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Imaginea exercitiului nu exista.");
      }

      return ResponseEntity.ok()
          .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
          .contentType(MediaType.parseMediaType("image/gif"))
          .body(response.getBody());
    } catch (RestClientResponseException exception) {
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY,
          "ExerciseDB nu a putut livra imaginea: status=" + exception.getStatusCode().value(),
          exception);
    }
  }

  private List<Exercise> fetchAllExercisesFromApi() {
    List<Exercise> exercises = new ArrayList<>();
    String nextCursor = null;
    boolean hasNextPage = true;

    while (hasNextPage) {
      String cursor = nextCursor;
      ExerciseDbPage page;

      try {
        String pageUrl =
            cursor != null && !cursor.isBlank()
                ? EXERCISE_DB_URL + "?limit=25&after=" + cursor
                : EXERCISE_DB_URL + "?limit=25";

        page = fetchExercisePageWithRetry(pageUrl);
        sleepBetweenPages();
      } catch (RestClientResponseException exception) {
        throw new ResponseStatusException(
            HttpStatus.BAD_GATEWAY,
            "ExerciseDB a refuzat requestul: status="
                + exception.getStatusCode().value()
                + " body="
                + exception.getResponseBodyAsString(),
            exception);
      }

      if (page == null || page.data() == null) {
        break;
      }

      exercises.addAll(page.data());
      hasNextPage = page.meta() != null && page.meta().hasNextPage();
      nextCursor = page.meta() != null ? page.meta().nextCursor() : null;

      if (hasNextPage && (nextCursor == null || nextCursor.isBlank())) {
        break;
      }
    }

    return exercises;
  }

  private ExerciseDbPage fetchExercisePageWithRetry(String pageUrl) {
    RestClientResponseException lastException = null;

    for (int attempt = 1; attempt <= 8; attempt++) {
      try {
        return restClient.get().uri(URI.create(pageUrl)).retrieve().body(ExerciseDbPage.class);
      } catch (RestClientResponseException exception) {
        lastException = exception;
        sleepBeforeRetry(attempt, exception.getStatusCode().value());
      }
    }

    throw lastException;
  }

  private void sleepBeforeRetry(int attempt, int statusCode) {
    try {
      long delay = statusCode == 429 ? 5000L * attempt : 700L * attempt;
      Thread.sleep(delay);
    } catch (InterruptedException exception) {
      Thread.currentThread().interrupt();
    }
  }

  private void sleepBetweenPages() {
    try {
      Thread.sleep(1200L);
    } catch (InterruptedException exception) {
      Thread.currentThread().interrupt();
    }
  }

  public String debugFirstPage() {
    return restClient
        .get()
        .uri(URI.create(EXERCISE_DB_URL + "?limit=25"))
        .retrieve()
        .body(String.class);
  }
}
