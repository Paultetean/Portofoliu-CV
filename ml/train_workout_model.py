import json
import math
import random
import unicodedata
import urllib.request
from pathlib import Path


FEATURES = [
    "age",
    "bmi",
    "male",
    "female",
    "beginner",
    "intermediate",
    "advanced",
    "goal_strength",
    "goal_muscle",
    "goal_fat_loss",
    "goal_conditioning",
    "restriction_knee",
    "restriction_shoulder",
    "restriction_back",
    "prompt_push",
    "prompt_pull",
    "prompt_legs",
    "prompt_core",
    "prompt_bodyweight",
    "prompt_dumbbell",
    "avoid_push_up",
    "avoid_pull_up",
    "avoid_dips",
    "avoid_squat",
    "focus_chest",
    "focus_triceps",
    "focus_biceps",
    "focus_shoulders",
    "focus_back",
    "focus_lats",
    "focus_quads",
    "focus_glutes",
    "focus_hamstrings",
    "focus_calves",
    "focus_abs",
    "equipment_cable",
    "equipment_barbell",
    "equipment_machine",
    "avoid_deadlift",
    "avoid_overhead_press",
    "low_impact",
    "short_session",
    "long_session",
    "explicit_priority_focus",
]


PROFILES = [
    {
        "profileId": "beginner_hypertrophy_male",
        "age": 22,
        "height": 178,
        "weight": 72,
        "sex": "masculin",
        "experience": "incepator",
        "goal": "masa musculara",
        "restrictions": "",
        "duration": 60,
    },
    {
        "profileId": "intermediate_hypertrophy_female",
        "age": 27,
        "height": 166,
        "weight": 62,
        "sex": "feminin",
        "experience": "intermediar",
        "goal": "masa musculara",
        "restrictions": "",
        "duration": 60,
    },
    {
        "profileId": "advanced_strength_male",
        "age": 31,
        "height": 183,
        "weight": 91,
        "sex": "masculin",
        "experience": "avansat",
        "goal": "forta",
        "restrictions": "",
        "duration": 75,
    },
    {
        "profileId": "beginner_fat_loss_female",
        "age": 38,
        "height": 162,
        "weight": 78,
        "sex": "feminin",
        "experience": "incepator",
        "goal": "slabire",
        "restrictions": "",
        "duration": 45,
    },
    {
        "profileId": "intermediate_conditioning_male",
        "age": 35,
        "height": 176,
        "weight": 84,
        "sex": "masculin",
        "experience": "intermediar",
        "goal": "conditionare",
        "restrictions": "",
        "duration": 60,
    },
    {
        "profileId": "knee_sensitive",
        "age": 42,
        "height": 170,
        "weight": 83,
        "sex": "feminin",
        "experience": "intermediar",
        "goal": "masa musculara",
        "restrictions": "genunchi sensibil, evita sarituri si flexie adanca",
        "duration": 60,
    },
    {
        "profileId": "shoulder_sensitive",
        "age": 29,
        "height": 181,
        "weight": 79,
        "sex": "masculin",
        "experience": "intermediar",
        "goal": "forta",
        "restrictions": "umar sensibil, evita impins vertical",
        "duration": 60,
    },
    {
        "profileId": "lower_back_sensitive",
        "age": 45,
        "height": 174,
        "weight": 89,
        "sex": "masculin",
        "experience": "intermediar",
        "goal": "slabire",
        "restrictions": "lombar sensibil, evita indreptari grele",
        "duration": 45,
    },
    {
        "profileId": "advanced_long_session",
        "age": 26,
        "height": 188,
        "weight": 96,
        "sex": "masculin",
        "experience": "avansat",
        "goal": "hipertrofie",
        "restrictions": "",
        "duration": 90,
    },
]


WORKOUT_BLUEPRINTS = [
    {
        "id": "chest_triceps_triceps_focus",
        "focus": "Hipertrofie push, piept si triceps",
        "prompts": [
            "zi de piept si triceps cu focus pe triceps",
            "push day piept triceps, vreau mai mult volum pe triceps",
            "piept si triceps, tricepsul este prioritar",
            "chest and triceps with triceps focus",
            "antrenament impins, final puternic pentru triceps",
        ],
        "targetGroups": ["upper arms", "chest"],
        "priorityTerms": ["triceps", "upper arms", "tricep"],
        "preferredEquipment": ["cable", "dumbbell", "leverage machine"],
        "setsBias": 1,
        "exerciseCountBias": 1,
        "repScheme": "hypertrophy",
    },
    {
        "id": "chest_triceps_chest_focus",
        "focus": "Hipertrofie push, piept dominant",
        "prompts": [
            "zi de piept si triceps cu focus pe piept",
            "push day cu prioritate pe piept",
            "vreau piept mai intens si triceps moderat",
            "chest dominant push workout",
        ],
        "targetGroups": ["chest", "upper arms", "shoulders"],
        "priorityTerms": ["pectorals", "chest"],
        "preferredEquipment": ["dumbbell", "barbell", "leverage machine"],
        "setsBias": 0,
        "exerciseCountBias": 0,
        "repScheme": "hypertrophy",
    },
    {
        "id": "triceps_isolation_no_dips",
        "focus": "Brate, triceps izolare",
        "prompts": [
            "triceps intens fara dips",
            "brate cu focus triceps, fara flotari si fara dips",
            "triceps la cablu fara exercitii de tip dips",
            "upper arms triceps no dips no push ups",
        ],
        "targetGroups": ["upper arms"],
        "priorityTerms": ["triceps", "upper arms"],
        "preferredEquipment": ["cable", "dumbbell"],
        "avoidPatterns": ["dip", "dips", "push-up", "push up", "pushup"],
        "setsBias": 1,
        "exerciseCountBias": 0,
        "repScheme": "hypertrophy",
    },
    {
        "id": "back_biceps_back_focus",
        "focus": "Pull, spate dominant",
        "prompts": [
            "zi de spate si biceps cu focus pe spate",
            "pull day cu accent pe spate",
            "spate lat si ramat, biceps secundar",
            "back and biceps with back focus",
        ],
        "targetGroups": ["back", "upper arms"],
        "priorityTerms": ["back", "lats"],
        "preferredEquipment": ["cable", "leverage machine", "barbell"],
        "setsBias": 0,
        "exerciseCountBias": 0,
        "repScheme": "hypertrophy",
    },
    {
        "id": "back_biceps_biceps_focus",
        "focus": "Pull, biceps prioritar",
        "prompts": [
            "zi de spate si biceps cu focus pe biceps",
            "pull day cu volum mare pentru biceps",
            "spate si biceps, vreau biceps mai intens",
            "back and biceps with biceps focus",
        ],
        "targetGroups": ["upper arms", "back"],
        "priorityTerms": ["biceps", "upper arms"],
        "preferredEquipment": ["dumbbell", "cable", "barbell"],
        "setsBias": 1,
        "exerciseCountBias": 1,
        "repScheme": "hypertrophy",
    },
    {
        "id": "pull_no_pullups",
        "focus": "Pull fara tractiuni",
        "prompts": [
            "spate si biceps fara pull ups",
            "pull day fara tractiuni",
            "fara pull-up, foloseste cablu si gantere",
            "back workout no pull ups",
        ],
        "targetGroups": ["back", "upper arms"],
        "priorityTerms": ["back", "biceps", "lats"],
        "preferredEquipment": ["cable", "dumbbell", "leverage machine"],
        "avoidPatterns": ["pull-up", "pull up", "pullup", "chin-up", "chin up", "chinup"],
        "setsBias": 0,
        "exerciseCountBias": 0,
        "repScheme": "hypertrophy",
    },
    {
        "id": "legs_quads_focus",
        "focus": "Picioare, cvadriceps dominant",
        "prompts": [
            "zi de picioare cu focus pe cvadriceps",
            "legs day quad focus",
            "picioare, quads prioritar",
            "antrenament coapse anterior",
        ],
        "targetGroups": ["upper legs", "lower legs"],
        "priorityTerms": ["quads", "upper legs"],
        "preferredEquipment": ["sled machine", "leverage machine", "barbell"],
        "setsBias": 0,
        "exerciseCountBias": 0,
        "repScheme": "hypertrophy",
    },
    {
        "id": "legs_glutes_focus",
        "focus": "Picioare, fesieri dominant",
        "prompts": [
            "zi de picioare cu focus pe fesieri",
            "glutes focus legs day",
            "picioare si fesieri, accent pe glute",
            "lower body cu prioritate pe glutei",
        ],
        "targetGroups": ["upper legs"],
        "priorityTerms": ["glutes", "upper legs"],
        "preferredEquipment": ["barbell", "leverage machine", "sled machine"],
        "setsBias": 1,
        "exerciseCountBias": 0,
        "repScheme": "hypertrophy",
    },
    {
        "id": "legs_hamstrings_focus",
        "focus": "Picioare, posterior dominant",
        "prompts": [
            "zi de picioare cu focus pe femurali",
            "hamstrings focus legs day",
            "posterior chain fara indreptari grele",
            "picioare, femurali si glutei",
        ],
        "targetGroups": ["upper legs"],
        "priorityTerms": ["hamstrings", "glutes", "upper legs"],
        "preferredEquipment": ["leverage machine", "dumbbell", "cable"],
        "avoidPatterns": ["deadlift"],
        "setsBias": 0,
        "exerciseCountBias": 0,
        "repScheme": "hypertrophy",
    },
    {
        "id": "legs_no_squat_knee",
        "focus": "Picioare fara genuflexiuni",
        "prompts": [
            "picioare fara genuflexiuni",
            "legs day no squat, genunchi sensibil",
            "vreau picioare fara squat si fara sarituri",
            "lower body low impact",
        ],
        "targetGroups": ["upper legs", "lower legs"],
        "priorityTerms": ["quads", "glutes", "hamstrings"],
        "preferredEquipment": ["leverage machine", "sled machine", "cable"],
        "avoidPatterns": ["squat", "lunge", "jump"],
        "setsBias": -1,
        "exerciseCountBias": 0,
        "repScheme": "controlled",
    },
    {
        "id": "shoulders_focus",
        "focus": "Umeri",
        "prompts": [
            "zi de umeri",
            "shoulders focus",
            "delts si stabilizare scapulara",
            "umeri cu gantere",
        ],
        "targetGroups": ["shoulders"],
        "priorityTerms": ["delts", "shoulders"],
        "preferredEquipment": ["dumbbell", "cable"],
        "setsBias": 0,
        "exerciseCountBias": 0,
        "repScheme": "hypertrophy",
    },
    {
        "id": "shoulder_sensitive_push",
        "focus": "Push cu umar sensibil",
        "prompts": [
            "push day cu umar sensibil",
            "piept si triceps fara impins deasupra capului",
            "evita overhead press",
            "chest triceps shoulder friendly",
        ],
        "targetGroups": ["chest", "upper arms"],
        "priorityTerms": ["pectorals", "triceps"],
        "preferredEquipment": ["dumbbell", "cable", "leverage machine"],
        "avoidPatterns": ["overhead press", "shoulder press", "upright row", "dip"],
        "setsBias": -1,
        "exerciseCountBias": 0,
        "repScheme": "controlled",
    },
    {
        "id": "core_abs",
        "focus": "Core",
        "prompts": [
            "core si abdomen",
            "abdomen cu focus pe control",
            "core day fara lombar agresiv",
            "abs and stability",
        ],
        "targetGroups": ["waist"],
        "priorityTerms": ["abs", "waist"],
        "preferredEquipment": ["body weight", "cable"],
        "setsBias": 0,
        "exerciseCountBias": 0,
        "repScheme": "conditioning",
    },
    {
        "id": "full_body_strength",
        "focus": "Full body forta",
        "prompts": [
            "full body de forta",
            "antrenament forta tot corpul",
            "strength full body",
            "baza forta fara prea multe izolari",
        ],
        "targetGroups": ["chest", "back", "upper legs"],
        "priorityTerms": ["pectorals", "back", "quads"],
        "preferredEquipment": ["barbell", "dumbbell", "leverage machine"],
        "setsBias": 1,
        "exerciseCountBias": -1,
        "repScheme": "strength",
    },
    {
        "id": "full_body_beginner",
        "focus": "Full body incepator",
        "prompts": [
            "full body pentru incepator",
            "incepator, tehnica de baza",
            "tot corpul, usor de executat",
            "general fitness beginner",
        ],
        "targetGroups": ["chest", "back", "upper legs", "waist"],
        "priorityTerms": ["chest", "back", "quads", "abs"],
        "preferredEquipment": ["dumbbell", "leverage machine", "body weight"],
        "setsBias": -1,
        "exerciseCountBias": -1,
        "repScheme": "controlled",
    },
    {
        "id": "conditioning_fat_loss",
        "focus": "Conditionare si slabire",
        "prompts": [
            "slabire si conditionare",
            "cardio strength circuit",
            "rezistenta musculara fara impact mare",
            "fat loss low impact",
        ],
        "targetGroups": ["waist", "upper legs", "chest", "back"],
        "priorityTerms": ["waist", "quads", "pectorals", "back"],
        "preferredEquipment": ["body weight", "dumbbell", "cable"],
        "setsBias": 0,
        "exerciseCountBias": 1,
        "repScheme": "conditioning",
    },
    {
        "id": "home_bodyweight_no_pushups",
        "focus": "Acasa fara flotari",
        "prompts": [
            "fara echipament si fara flotari",
            "bodyweight no push ups",
            "acasa fara push-up",
            "full body fara flotari",
        ],
        "targetGroups": ["waist", "upper legs", "back"],
        "priorityTerms": ["abs", "quads", "back"],
        "preferredEquipment": ["body weight"],
        "avoidPatterns": ["push-up", "push up", "pushup"],
        "setsBias": -1,
        "exerciseCountBias": 0,
        "repScheme": "conditioning",
    },
    {
        "id": "cable_upper_body",
        "focus": "Upper body la cablu",
        "prompts": [
            "upper body doar la cablu",
            "piept spate brate cu cabluri",
            "cablu, fara bara",
            "machine cable upper body",
        ],
        "targetGroups": ["chest", "back", "upper arms"],
        "priorityTerms": ["pectorals", "back", "triceps", "biceps"],
        "preferredEquipment": ["cable", "leverage machine"],
        "setsBias": 0,
        "exerciseCountBias": 1,
        "repScheme": "hypertrophy",
    },
]


ROMANIAN_MONTHS = [
    "ianuarie",
    "februarie",
    "martie",
    "aprilie",
    "mai",
    "iunie",
    "iulie",
    "august",
    "septembrie",
    "octombrie",
    "noiembrie",
    "decembrie",
]


def normalize_text(value):
    normalized = unicodedata.normalize("NFKD", value or "")
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    return ascii_text.lower()


def contains_any(text, *needles):
    normalized = normalize_text(text)
    return any(normalize_text(needle) in normalized for needle in needles)


def vectorize(sample):
    height_m = sample["height"] / 100
    bmi = sample["weight"] / max(height_m * height_m, 1)
    text = normalize_text(
        " ".join(
            [
                sample["sex"],
                sample["experience"],
                sample["goal"],
                sample["restrictions"],
                sample["focus"],
                sample["prompt"],
            ]
        )
    )
    duration = sample["duration"]

    return [
        sample["age"] / 100,
        min(bmi / 50, 1),
        1 if "masculin" in text else 0,
        1 if "feminin" in text else 0,
        1 if "incepator" in text else 0,
        1 if "intermediar" in text else 0,
        1 if "avansat" in text else 0,
        1 if contains_any(text, "forta", "strength", "power") else 0,
        1 if contains_any(text, "masa", "hipertrofie", "muscular") else 0,
        1 if contains_any(text, "slabire", "fat loss") else 0,
        1 if contains_any(text, "conditionare", "rezistenta", "conditioning") else 0,
        1 if contains_any(text, "genunchi", "knee") else 0,
        1 if contains_any(text, "umar", "shoulder") else 0,
        1 if contains_any(text, "lombar", "spate sensibil", "lower back") else 0,
        1 if contains_any(text, "push", "piept", "chest", "impins") else 0,
        1 if contains_any(text, "pull", "spate", "back") else 0,
        1 if contains_any(text, "picioare", "legs", "lower body") else 0,
        1 if contains_any(text, "core", "abdomen", "abs") else 0,
        1 if contains_any(text, "fara echipament", "bodyweight", "acasa") else 0,
        1 if contains_any(text, "gantere", "dumbbell") else 0,
        1 if contains_any(text, "fara flotari", "no push", "fara push-up", "no push ups") else 0,
        1 if contains_any(text, "fara tractiuni", "fara pull-up", "no pull", "no pull ups") else 0,
        1 if contains_any(text, "fara dips", "no dips") else 0,
        1 if contains_any(text, "fara genuflexiuni", "fara squat", "no squat") else 0,
        1 if contains_any(text, "piept", "chest", "pectorals") else 0,
        1 if contains_any(text, "triceps", "tricep") else 0,
        1 if contains_any(text, "biceps", "bicep") else 0,
        1 if contains_any(text, "umeri", "shoulders", "delts") else 0,
        1 if contains_any(text, "spate", "back") else 0,
        1 if contains_any(text, "lats", "latime") else 0,
        1 if contains_any(text, "cvadriceps", "quads", "coapse anterior") else 0,
        1 if contains_any(text, "fesieri", "glute", "glutes") else 0,
        1 if contains_any(text, "femurali", "hamstrings", "posterior") else 0,
        1 if contains_any(text, "gambe", "calves") else 0,
        1 if contains_any(text, "abdomen", "abs", "core") else 0,
        1 if contains_any(text, "cablu", "cable") else 0,
        1 if contains_any(text, "bara", "barbell") else 0,
        1 if contains_any(text, "aparat", "machine", "leverage", "sled") else 0,
        1 if contains_any(text, "fara indreptari", "no deadlift", "avoid deadlift") else 0,
        1 if contains_any(text, "fara impins deasupra", "overhead press", "shoulder press") else 0,
        1 if contains_any(text, "low impact", "fara impact", "fara sarituri") else 0,
        1 if duration <= 45 else 0,
        1 if duration >= 90 else 0,
        1 if contains_any(text, "focus", "accent", "prioritar", "prioritate", "dominant") else 0,
    ]


def unique(values):
    return list(dict.fromkeys(value for value in values if value))


def choose_rep_range(sample, blueprint):
    scheme = blueprint["repScheme"]
    goal = normalize_text(sample["goal"])
    experience = normalize_text(sample["experience"])

    if scheme == "strength":
        return [5, 7] if "incepator" in experience else [4, 6]
    if scheme == "conditioning":
        return [12, 18]
    if scheme == "controlled":
        return [10, 14]
    if scheme == "hypertrophy":
        return [8, 12]
    if contains_any(goal, "forta"):
        return [5, 7] if "incepator" in experience else [4, 6]
    if contains_any(goal, "slabire", "conditionare", "rezistenta"):
        return [12, 18]
    return [8, 12]


def adapt_label(sample, blueprint):
    text = normalize_text(
        " ".join([sample["goal"], sample["restrictions"], sample["focus"], sample["prompt"]])
    )
    groups = list(blueprint["targetGroups"])
    priority_terms = list(blueprint["priorityTerms"])
    avoid_patterns = list(blueprint.get("avoidPatterns", []))
    preferred_equipment = list(blueprint.get("preferredEquipment", []))

    if contains_any(text, "genunchi", "knee"):
        avoid_patterns.extend(["jump", "lunge", "deep squat"])
        preferred_equipment.extend(["leverage machine", "sled machine", "cable"])
    if contains_any(text, "umar", "shoulder"):
        groups = [group for group in groups if group != "shoulders"] or ["chest", "upper arms"]
        avoid_patterns.extend(["overhead press", "shoulder press", "upright row", "dip"])
        preferred_equipment.extend(["cable", "dumbbell", "leverage machine"])
    if contains_any(text, "lombar", "lower back", "spate sensibil"):
        avoid_patterns.extend(["deadlift", "good morning", "hyperextension"])
        preferred_equipment.extend(["leverage machine", "cable", "dumbbell"])

    if contains_any(text, "fara flotari", "no push", "no push ups", "fara push-up"):
        avoid_patterns.extend(["push-up", "push up", "pushup"])
    if contains_any(text, "fara tractiuni", "no pull", "no pull ups", "fara pull-up"):
        avoid_patterns.extend(["pull-up", "pull up", "pullup", "chin-up", "chin up", "chinup"])
    if contains_any(text, "fara dips", "no dips"):
        avoid_patterns.extend(["dip", "dips"])
    if contains_any(text, "fara genuflexiuni", "no squat", "fara squat"):
        avoid_patterns.extend(["squat"])
    if contains_any(text, "fara indreptari", "no deadlift"):
        avoid_patterns.extend(["deadlift"])
    if contains_any(text, "fara impins deasupra", "no overhead", "overhead press"):
        avoid_patterns.extend(["overhead press", "shoulder press"])

    if contains_any(text, "gantere", "dumbbell"):
        preferred_equipment.insert(0, "dumbbell")
    if contains_any(text, "cablu", "cable"):
        preferred_equipment.insert(0, "cable")
    if contains_any(text, "bara", "barbell"):
        preferred_equipment.insert(0, "barbell")
    if contains_any(text, "fara echipament", "bodyweight", "acasa"):
        preferred_equipment = ["body weight"]

    reps = choose_rep_range(sample, blueprint)
    sets = 3 + blueprint.get("setsBias", 0)
    if contains_any(sample["experience"], "incepator"):
        sets = min(sets, 3)
    if contains_any(sample["experience"], "avansat"):
        sets = max(sets, 4)
    if contains_any(text, "sensibil", "durere", "accidentare"):
        sets = max(2, sets - 1)
    sets = max(2, min(5, sets))

    if sample["duration"] <= 45:
        exercise_count = 4
    elif sample["duration"] >= 90:
        exercise_count = 7
    elif sample["duration"] >= 75:
        exercise_count = 6
    else:
        exercise_count = 5
    exercise_count = max(3, min(7, exercise_count + blueprint.get("exerciseCountBias", 0)))

    return {
        "targetGroups": unique(groups),
        "priorityTerms": unique(priority_terms),
        "sets": sets,
        "minReps": reps[0],
        "maxReps": reps[1],
        "exerciseCount": exercise_count,
        "avoidPatterns": unique(avoid_patterns),
        "preferredEquipment": unique(preferred_equipment),
    }


def load_exercise_catalog():
    try:
        with urllib.request.urlopen("http://localhost:8081/api/exercises", timeout=5) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception:
        return []


def catalog_prompt_samples(exercises, limit=260):
    samples = []
    for exercise in exercises[:limit]:
        name = exercise.get("name", "")
        equipments = ", ".join(exercise.get("equipments") or [])
        target_muscles = ", ".join(exercise.get("targetMuscles") or [])
        body_parts = ", ".join(exercise.get("bodyParts") or [])
        if name and (target_muscles or body_parts):
            samples.append(
                {
                    "name": name,
                    "prompt": (
                        f"include exercitii similare cu {name}, echipament {equipments}, "
                        f"muschi {target_muscles}, zona {body_parts}"
                    ),
                    "targetText": f"{target_muscles} {body_parts}",
                    "equipmentText": equipments,
                }
            )
    return samples


def blueprint_for_catalog_sample(sample):
    target = normalize_text(sample["targetText"])
    equipment = normalize_text(sample["equipmentText"])
    groups = []
    priority_terms = []

    if contains_any(target, "triceps"):
        groups = ["upper arms"]
        priority_terms = ["triceps", "upper arms"]
    elif contains_any(target, "biceps"):
        groups = ["upper arms"]
        priority_terms = ["biceps", "upper arms"]
    elif contains_any(target, "pectorals", "chest"):
        groups = ["chest"]
        priority_terms = ["pectorals", "chest"]
    elif contains_any(target, "lats", "back"):
        groups = ["back"]
        priority_terms = ["lats", "back"]
    elif contains_any(target, "delts", "shoulders"):
        groups = ["shoulders"]
        priority_terms = ["delts", "shoulders"]
    elif contains_any(target, "quads"):
        groups = ["upper legs"]
        priority_terms = ["quads", "upper legs"]
    elif contains_any(target, "glutes"):
        groups = ["upper legs"]
        priority_terms = ["glutes", "upper legs"]
    elif contains_any(target, "hamstrings"):
        groups = ["upper legs"]
        priority_terms = ["hamstrings", "upper legs"]
    elif contains_any(target, "abs", "waist"):
        groups = ["waist"]
        priority_terms = ["abs", "waist"]
    else:
        groups = ["chest", "back", "upper legs"]
        priority_terms = ["chest", "back", "quads"]

    preferred_equipment = []
    if contains_any(equipment, "dumbbell"):
        preferred_equipment.append("dumbbell")
    if contains_any(equipment, "cable"):
        preferred_equipment.append("cable")
    if contains_any(equipment, "barbell"):
        preferred_equipment.append("barbell")
    if contains_any(equipment, "machine", "sled", "leverage"):
        preferred_equipment.append("leverage machine")
    if contains_any(equipment, "body weight"):
        preferred_equipment.append("body weight")

    return {
        "id": f"catalog_{sample['name'][:32]}",
        "focus": "Catalog TET-FIT actual",
        "prompts": [sample["prompt"]],
        "targetGroups": groups,
        "priorityTerms": priority_terms,
        "preferredEquipment": preferred_equipment,
        "setsBias": 0,
        "exerciseCountBias": 0,
        "repScheme": "hypertrophy",
    }


def make_dataset(exercises):
    dataset = []
    rng = random.Random(20260601)
    blueprints = list(WORKOUT_BLUEPRINTS)
    blueprints.extend(blueprint_for_catalog_sample(sample) for sample in catalog_prompt_samples(exercises))

    for profile in PROFILES:
        for blueprint in blueprints:
            for prompt in blueprint["prompts"]:
                focus_variants = [
                    blueprint["focus"],
                    "Performanta, forta si conditionare",
                    "Hipertrofie si masa musculara",
                    "Slabire si mobilitate",
                ]
                for focus in focus_variants:
                    sample = {**profile, "focus": focus, "prompt": prompt}
                    dataset.append({"input": sample, "output": adapt_label(sample, blueprint)})

    exception_prompts = [
        "fara flotari",
        "fara push ups",
        "fara pull ups",
        "fara tractiuni",
        "fara dips",
        "fara genuflexiuni",
        "fara indreptari",
        "fara impins deasupra capului",
        "cu cablu",
        "doar gantere",
        "doar aparate",
        "fara echipament",
    ]
    base_blueprints = WORKOUT_BLUEPRINTS[:]
    while len(dataset) < 3600:
        profile = dict(rng.choice(PROFILES))
        blueprint = rng.choice(base_blueprints)
        prompt = rng.choice(blueprint["prompts"])
        if rng.random() < 0.45:
            prompt = f"{prompt}, {rng.choice(exception_prompts)}"
        if rng.random() < 0.25:
            prompt = f"{prompt}, durata {rng.choice([40, 45, 60, 75, 90])} minute"
        profile["duration"] = rng.choice([40, 45, 60, 75, 90])
        profile["focus"] = rng.choice(
            [
                blueprint["focus"],
                "Performanta, forta si conditionare",
                "Hipertrofie si masa musculara",
                "Slabire si mobilitate",
                "Forta si tehnica de baza",
            ]
        )
        sample = {**profile, "prompt": prompt}
        dataset.append({"input": sample, "output": adapt_label(sample, blueprint)})

    return dataset


def vector_distance(left, right):
    return math.sqrt(sum((a - b) * (a - b) for a, b in zip(left, right)))


def nearest_debug_neighbors(dataset, query, limit=5):
    vector = vectorize(query)
    neighbors = sorted(
        (
            {
                "distance": round(vector_distance(vector, vectorize(example["input"])), 4),
                "prompt": example["input"]["prompt"],
                "profileId": example["input"]["profileId"],
                "output": example["output"],
            }
            for example in dataset
        ),
        key=lambda item: item["distance"],
    )
    return neighbors[:limit]


def main():
    exercises = load_exercise_catalog()
    dataset = make_dataset(exercises)
    root = Path(__file__).resolve().parents[1]
    dataset_output = root / "ml" / "workout_training_dataset.json"
    model_output = root / "auth-service" / "src" / "main" / "resources" / "workout_model.json"

    model_examples = [
        {
            "id": index,
            "vector": vectorize(example["input"]),
            "label": example["output"],
        }
        for index, example in enumerate(dataset)
    ]

    smoke_query = {
        **PROFILES[1],
        "focus": "Hipertrofie si masa musculara",
        "prompt": "zi de piept si triceps cu focus pe triceps",
    }
    smoke_neighbors = nearest_debug_neighbors(dataset, smoke_query)

    dataset_output.write_text(
        json.dumps(
            {
                "description": (
                    "Curated supervised dataset for TET-FIT workout generation. "
                    "Examples combine trainer prompts, client profile stats, plan focus, "
                    "injury restrictions, equipment constraints and actual ExerciseDB catalog terms."
                ),
                "samples": dataset,
                "smokeTest": {
                    "query": smoke_query,
                    "nearestNeighbors": smoke_neighbors,
                },
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    model_output.write_text(
        json.dumps(
            {
                "modelType": "knn-v1",
                "description": (
                    "TET-FIT supervised KNN workout recommender trained on curated trainer examples "
                    "and ExerciseDB-aware prompts. It predicts target muscle groups, priority terms, "
                    "avoid patterns, equipment preference and set/rep structure."
                ),
                "features": FEATURES,
                "trainingSamples": len(dataset),
                "exerciseCatalogSamples": len(exercises),
                "k": 7,
                "examples": model_examples,
                "smokeTest": smoke_neighbors,
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    print(f"wrote {dataset_output}")
    print(f"wrote {model_output}")
    print(f"training samples: {len(dataset)}")
    print(f"exercise catalog samples: {len(exercises)}")
    print("smoke test nearest output:")
    print(json.dumps(smoke_neighbors[0]["output"], indent=2))


if __name__ == "__main__":
    main()
