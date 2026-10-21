import React from "react";
import { createRoot } from "react-dom/client";
import catalinaTrainerImage from "../assets/trainer-catalina.png";
import paulTrainerImage from "../assets/trainer-paul.png";
import tetFitLogoImage from "../assets/tet-fit-logo.png";
import "../styles/main.css";

const AUTH_STORAGE_KEY = "tet-fit-auth";
const PENDING_PLAN_STORAGE_KEY = "tet-fit-pending-plan";
const DISMISSED_NOTIFICATIONS_KEY = "tet-fit-dismissed-notifications";
const EXERCISE_DB_URL = "https://oss.exercisedb.dev/api/v1/exercises";
const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"
    : "";
const AUTH_API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081/api/auth"
    : "/api/auth";
const TRAINER_MEDIA_BY_NAME = {
  "Paul Tetean": {
    image: paulTrainerImage,
    shortDescription:
      "Planuri pentru forta, masa musculara si recompozitie, cu progres masurat clar de la o saptamana la alta.",
    tags: ["Forta", "Hipertrofie", "Tehnica"],
  },
  "Catalina Buzan": {
    image: catalinaTrainerImage,
    shortDescription:
      "Antrenamente pentru slabire, tonifiere si mobilitate, adaptate nivelului de experienta si ritmului tau.",
    tags: ["Tonifiere", "Mobilitate", "Slabire"],
  },
};
const LANDING_TRAINERS = [
  {
    name: "Paul Tetean",
    role: "Antrenor personal",
    description: TRAINER_MEDIA_BY_NAME["Paul Tetean"].shortDescription,
    image: TRAINER_MEDIA_BY_NAME["Paul Tetean"].image,
    tags: TRAINER_MEDIA_BY_NAME["Paul Tetean"].tags,
  },
  {
    name: "Catalina Buzan",
    role: "Antrenor pentru femei",
    description: TRAINER_MEDIA_BY_NAME["Catalina Buzan"].shortDescription,
    image: TRAINER_MEDIA_BY_NAME["Catalina Buzan"].image,
    tags: TRAINER_MEDIA_BY_NAME["Catalina Buzan"].tags,
  },
];
const APP_MODULES = [
  {
    index: "01",
    title: "Dashboard client",
    description:
      "Planul activ, exercitiile atribuite, progresul incarcat si urmatoarea sedinta stau in acelasi ecran.",
  },
  {
    index: "02",
    title: "Workspace antrenor",
    description:
      "Antrenorul vede clientii, zilele de lucru, rezultatele si poate ajusta planurile fara fisiere separate.",
  },
  {
    index: "03",
    title: "Calendar si rezervari",
    description:
      "Sedinte disponibile, rezervari si cereri de programare sunt legate direct de planul clientului.",
  },
  {
    index: "04",
    title: "Progres masurabil",
    description:
      "Greutate, repetari, serii si note sunt transformate in istoric util pentru decizii de antrenament.",
  },
  {
    index: "05",
    title: "Chat client-antrenor",
    description:
      "Feedback-ul si instructiunile raman langa plan, astfel incat fiecare schimbare are context.",
  },
  {
    index: "06",
    title: "Administrare",
    description:
      "Conturi, planuri, plati si activitatea platformei pot fi urmarite dintr-o zona dedicata.",
  },
];

function getStoredAuth() {
  const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession);

    if (!session?.token || !session?.user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function saveAuthSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function getUserRole(user) {
  if (user?.role === "SUPER_ADMIN") {
    return "SUPER_ADMIN";
  }
  return user?.role === "TRAINER" ? "TRAINER" : "CLIENT";
}

function getRoleDashboardPath(user) {
  const role = getUserRole(user);
  if (role === "SUPER_ADMIN") {
    return "/super-admin-dashboard";
  }
  return role === "TRAINER" ? "/antrenor-dashboard" : "/dashboard";
}

function getTrainerMedia(name) {
  return TRAINER_MEDIA_BY_NAME[name] ?? null;
}

function getTrainerInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function getLandingHeroActions(user) {
  if (!user) {
    return [
      { label: "Creeaza cont", href: "/register" },
      { label: "Descopera aplicatia", href: "#app" },
      { label: "Vezi antrenori", href: "/antrenori" },
    ];
  }

  const role = getUserRole(user);

  if (role === "SUPER_ADMIN") {
    return [
      { label: "Administrare", href: "/super-admin-dashboard" },
      { label: "Vezi antrenori", href: "/antrenori" },
    ];
  }

  if (role === "TRAINER") {
    return [
      { label: "Clienti si planuri", href: "/antrenor-dashboard" },
      { label: "Exercitii", href: "/exercitii" },
    ];
  }

  return [
    { label: "Plan activ", href: "/plan-activ" },
    { label: "Calendar", href: "/dashboard#calendar" },
    { label: "Profil", href: "/datele-mele" },
  ];
}

function getLandingAccessCards(user) {
  if (!user) {
    return [
      {
        title: "Log in",
        description: "Intri direct in contul tau TET-FIT si continui de unde ai ramas.",
        href: "/login",
        action: "Deschide login",
      },
      {
        title: "Cont client",
        description: "Creezi profilul, alegi un plan si il conectezi cu antrenorul potrivit.",
        href: "/register",
        action: "Creeaza cont",
      },
      {
        title: "Antrenori",
        description: "Vezi specializarile, descrierile si pachetele disponibile.",
        href: "/antrenori",
        action: "Vezi lista",
      },
    ];
  }

  const role = getUserRole(user);

  if (role === "SUPER_ADMIN") {
    return [
      {
        title: "Administrare",
        description: "Gestionezi utilizatori, antrenori, plati si activitatea platformei.",
        href: "/super-admin-dashboard",
        action: "Deschide",
      },
      {
        title: "Antrenori publici",
        description: "Verifici cum se vad antrenorii si pachetele pentru clienti.",
        href: "/antrenori",
        action: "Vezi pagina",
      },
      {
        title: "Dashboard",
        description: "Revii la sumarul operational al aplicatiei.",
        href: "/super-admin-dashboard",
        action: "Continua",
      },
    ];
  }

  if (role === "TRAINER") {
    return [
      {
        title: "Dashboard antrenor",
        description: "Vezi clientii, planurile active, calendarul si progresul incarcat.",
        href: "/antrenor-dashboard",
        action: "Deschide",
      },
      {
        title: "Catalog exercitii",
        description: "Cauti exercitii si alegi rapid variante potrivite pentru planuri.",
        href: "/exercitii",
        action: "Vezi catalog",
      },
      {
        title: "Profil public",
        description: "Verifici pagina publica unde clientii vad pachetele de antrenament.",
        href: "/antrenori",
        action: "Vezi pagina",
      },
    ];
  }

  return [
    {
      title: "Dashboard client",
      description: "Vezi planul activ, exercitiile atribuite si progresul tau.",
      href: "/dashboard",
      action: "Deschide",
    },
    {
      title: "Plan activ",
      description: "Urmaresti pachetul ales, antrenorul si detaliile planului.",
      href: "/plan-activ",
      action: "Vezi planul",
    },
    {
      title: "Calendar",
      description: "Ajungi direct la programari si sedintele disponibile.",
      href: "/dashboard#calendar",
      action: "Vezi calendar",
    },
  ];
}

function savePendingPlan(planId) {
  localStorage.setItem(PENDING_PLAN_STORAGE_KEY, JSON.stringify({ planId }));
}

async function attachPendingPlanToAccount(user) {
  const rawPendingPlan = localStorage.getItem(PENDING_PLAN_STORAGE_KEY);

  if (!rawPendingPlan || !user || getUserRole(user) !== "CLIENT") {
    return;
  }

  try {
    const pendingPlan = JSON.parse(rawPendingPlan);

    if (pendingPlan?.planId) {
      await apiRequest("/api/client/plan", {
        method: "POST",
        body: JSON.stringify({ planId: pendingPlan.planId }),
      });
    }
  } catch {
    // Ignore invalid pending selections and clear them below.
  } finally {
    localStorage.removeItem(PENDING_PLAN_STORAGE_KEY);
  }
}

function getPlanEndDate(plan) {
  if (!plan?.selectedAt) {
    return null;
  }

  const date = new Date(plan.selectedAt);
  date.setMonth(date.getMonth() + 1);
  return date;
}

function getPlanMinimumEndDate(plan) {
  const date = getPlanEndDate(plan);
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("ro-RO");
}

function isPlanExpired(plan) {
  const endDate = getPlanEndDate(plan);
  return endDate ? endDate.getTime() < Date.now() : false;
}

function groupAssignedExercisesByDay(exercises) {
  return exercises.reduce((groups, exercise) => {
    const dayName = exercise.dayName || "Ziua de antrenament";
    const currentGroup = groups[dayName] ?? {
      dayName,
      muscleGroups: new Set(),
      exercises: [],
    };

    (exercise.muscleGroups ?? []).forEach((group) => currentGroup.muscleGroups.add(group));
    currentGroup.exercises.push(exercise);

    return { ...groups, [dayName]: currentGroup };
  }, {});
}

function toDateInputValue(date) {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 10);
}

function getDateFromInputValue(value) {
  if (!value) {
    return new Date();
  }

  const date = new Date(`${value}T00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

const NUTRITION_METRICS = [
  { key: "calories", label: "kcal", unit: "kcal" },
  { key: "protein", label: "Proteine", unit: "g" },
  { key: "carbs", label: "Carbohidrati", unit: "g" },
  { key: "fats", label: "Grasimi", unit: "g" },
  { key: "weight", label: "Greutate", unit: "kg" },
];

function getNutritionMetric(metric) {
  return NUTRITION_METRICS.find((item) => item.key === metric) ?? NUTRITION_METRICS[0];
}

function formatNutritionValue(value, metric) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  const unit = getNutritionMetric(metric).unit;
  const precision = metric === "weight" && numericValue % 1 !== 0 ? 1 : 0;
  return `${numericValue.toFixed(precision)} ${unit}`;
}

function getNutritionProfileMissingFields(profile = {}) {
  const fields = [
    ["age", "varsta"],
    ["height", "inaltimea"],
    ["weight", "greutatea"],
    ["sex", "sexul"],
    ["lifestyle", "stilul de viata"],
    ["goal", "obiectivul"],
  ];

  return fields
    .filter(([key]) => profile[key] === null || profile[key] === undefined || profile[key] === "")
    .map(([, label]) => label);
}

function isNutritionProfileComplete(profile = {}) {
  return getNutritionProfileMissingFields(profile).length === 0;
}

function sortNutritionLogs(logs = []) {
  return [...logs].sort((first, second) => new Date(first.date) - new Date(second.date));
}

function buildNutritionChartPoints(logs = [], metric) {
  return sortNutritionLogs(logs)
    .filter((log) => log[metric] !== null && log[metric] !== undefined)
    .map((log) => ({
      ...log,
      date: getDateFromInputValue(log.date),
      dateKey: log.date,
      label: getDateFromInputValue(log.date).toLocaleDateString("ro-RO", {
        day: "2-digit",
        month: "2-digit",
      }),
    }));
}

function getNutritionLogForDate(logs = [], dateValue) {
  return logs.find((log) => log.date === dateValue) ?? null;
}

function formatSignedWeight(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  const prefix = numericValue > 0 ? "+" : "";
  return `${prefix}${numericValue.toFixed(numericValue % 1 === 0 ? 0 : 1)} kg`;
}

function formatProfileTargetDate(value) {
  if (!value) {
    return "-";
  }

  return getDateFromInputValue(value).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getWeightGoalSummary(profile = {}) {
  if (profile.targetWeight === null || profile.targetWeight === undefined || profile.targetWeight === "") {
    return null;
  }

  const currentWeight = Number(profile.weight);
  const targetWeight = Number(profile.targetWeight);
  const hasCurrentWeight = Number.isFinite(currentWeight);
  const hasTargetWeight = Number.isFinite(targetWeight);
  const delta = hasCurrentWeight && hasTargetWeight ? targetWeight - currentWeight : null;

  return {
    currentWeight: hasCurrentWeight ? currentWeight : null,
    targetWeight: hasTargetWeight ? targetWeight : null,
    delta,
    targetDate: profile.targetDate ?? null,
  };
}

function toDateTimeInputValue(date) {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 16);
}

function getWeekStart(date) {
  const weekStart = new Date(date);
  const day = weekStart.getDay() || 7;
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - day + 1);
  return weekStart;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getNotificationDismissedIds() {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function dismissNotification(notificationId) {
  const currentIds = getNotificationDismissedIds();
  if (!currentIds.includes(notificationId)) {
    localStorage.setItem(
      DISMISSED_NOTIFICATIONS_KEY,
      JSON.stringify([...currentIds, notificationId])
    );
  }
}

function getClientNotifications(plan, messages, assignedExercises, appointments = []) {
  const notifications = [];
  const dismissedIds = getNotificationDismissedIds();

  if (plan?.selectedAt) {
    const endDate = new Date(plan.selectedAt);
    endDate.setMonth(endDate.getMonth() + 1);
    const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 7) {
      notifications.push(
        {
          id: `plan-expiry-${plan.id}-${endDate.toISOString().slice(0, 10)}`,
          label:
            daysLeft >= 0
              ? `Abonamentul expira in ${daysLeft} zile.`
              : "Abonamentul este expirat. Reinnoieste-l din Plan activ.",
          href: "/plan-activ",
        }
      );
    }
  }

  const unreadTrainerMessages = messages.filter((message) => message.senderRole === "TRAINER");
  if (unreadTrainerMessages.length) {
    const latestMessage = unreadTrainerMessages[unreadTrainerMessages.length - 1];
    notifications.push({
      id: `trainer-message-${latestMessage.id}`,
      label: `Ai ${unreadTrainerMessages.length} mesaje de la antrenor.`,
      href: "/dashboard#chat",
    });
  }

  const pendingExercises = assignedExercises.filter(
    (exercise) => !exercise.repsPerSet?.length
  ).length;
  if (pendingExercises) {
    notifications.push({
      id: `pending-exercises-${pendingExercises}`,
      label: `${pendingExercises} exercitii asteapta completarea repetarilor.`,
      href: "/dashboard#antrenamente",
    });
  }

  const nextAppointment = appointments
    .filter((appointment) => new Date(appointment.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];
  if (nextAppointment) {
    notifications.push({
      id: `appointment-${nextAppointment.id}`,
      label: `Urmatoarea sedinta: ${new Date(nextAppointment.scheduledAt).toLocaleString("ro-RO")}.`,
      href: "/dashboard#calendar",
    });
  }

  return notifications.filter((notification) => !dismissedIds.includes(notification.id));
}

function redirectToDashboard(session) {
  window.location.href = getRoleDashboardPath(session.user);
}

function getHomeHref(user) {
  return user ? getRoleDashboardPath(user) : "/";
}

async function apiRequest(path, options = {}) {
  const session = getStoredAuth();
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(session?.token ? { Authorization: `${session.tokenType ?? "Bearer"} ${session.token}` } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
      window.location.href = "/login";
    }

    throw new Error(data?.message ?? "A aparut o eroare. Incearca din nou.");
  }

  return data;
}

async function submitAuthRequest(path, payload) {
  const response = await fetch(`${AUTH_API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "A aparut o eroare. Incearca din nou.");
  }

  if (response.status === 204) {
    return null;
  }

  return data;
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

async function fetchExercisePage(cursor = "") {
  const url = new URL(EXERCISE_DB_URL);
  url.searchParams.set("limit", "25");

  if (cursor) {
    url.searchParams.set("after", cursor);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Nu am putut incarca exercitiile.");
  }

  return response.json();
}

async function fetchExercisePageWithRetry(cursor = "") {
  try {
    return await fetchExercisePage(cursor);
  } catch (error) {
    await wait(500);
    return fetchExercisePage(cursor);
  }
}

function TetFitLogo() {
  return <img className="brand-logo" src={tetFitLogoImage} alt="TET-FIT" />;
}

function getExerciseImageCandidates(exerciseId, gifUrl) {
  const candidates = [];

  if (gifUrl) {
    candidates.push(gifUrl);
  }

  if (exerciseId) {
    candidates.push(`${API_BASE_URL}/api/exercises/${encodeURIComponent(exerciseId)}/image`);
  }

  return candidates;
}

function getExerciseMediaInitials(name = "") {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "EX";
}

function ExerciseMedia({ exerciseId, gifUrl, name, className = "", loading = "lazy" }) {
  const imageCandidates = React.useMemo(
    () => getExerciseImageCandidates(exerciseId, gifUrl),
    [exerciseId, gifUrl]
  );
  const [candidateIndex, setCandidateIndex] = React.useState(0);
  const [hasImageError, setHasImageError] = React.useState(false);
  const imageUrl = imageCandidates[candidateIndex] ?? "";

  React.useEffect(() => {
    setCandidateIndex(0);
    setHasImageError(false);
  }, [imageCandidates]);

  if (!imageUrl || hasImageError) {
    return (
      <div className={`exercise-media-fallback ${className}`.trim()} role="img" aria-label={name}>
        <span>{getExerciseMediaInitials(name)}</span>
        <small>{name}</small>
      </div>
    );
  }

  return (
    <img
      className={className || undefined}
      src={imageUrl}
      alt=""
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => {
        if (candidateIndex < imageCandidates.length - 1) {
          setCandidateIndex((currentIndex) => currentIndex + 1);
          return;
        }

        setHasImageError(true);
      }}
    />
  );
}

function LandingPage() {
  const session = getStoredAuth();
  const user = session?.user;
  const dashboardHref = user ? getRoleDashboardPath(user) : "/login";
  const heroActions = getLandingHeroActions(user);
  const accessCards = getLandingAccessCards(user);
  const accessTitle = user ? "Continua in aplicatie." : "Intra in TET-FIT fara pasi inutili.";
  const accessCopy = user
    ? "Esti deja autentificat, asa ca actiunile de mai jos te duc direct in zonele reale ale contului tau."
    : "Alege actiunea potrivita: autentificare, cont nou sau pagina publica de antrenori.";

  return (
    <main className="page-shell landing-shell">
      <section className="hero landing-hero">
        <nav className="topbar" aria-label="Navigatie principala">
          <a className="brand" href={getHomeHref(user)}>
            <TetFitLogo />
            <span>TET-FIT</span>
          </a>
          <div className="nav-links">
            <ClientNotificationsButton />
            <a className="nav-action nav-secondary-mobile-hidden" href="#app">
              Descopera aplicatia
            </a>
            <a className="nav-action nav-secondary-mobile-hidden" href="#trainers">
              Vezi antrenori
            </a>
            {user ? (
              <a className="nav-action nav-action-strong" href={getRoleDashboardPath(user)}>
                Dashboard
              </a>
            ) : (
              <>
                <a className="nav-action" href="/register">
                  Cont nou
                </a>
                <a className="nav-action nav-action-strong nav-login" href="/login">
                  Log in
                </a>
              </>
            )}
          </div>
        </nav>

        <div className="hero-grid landing-hero-grid">
          <div className="hero-content">
            <p className="eyebrow">Platforma de antrenament si progres</p>
            <h1>TET-FIT</h1>
            <p className="hero-copy">
              O aplicatie profesionala pentru clienti si antrenori: planuri clare,
              exercitii atribuite, progres masurat, programari si comunicare intr-un
              singur dashboard.
            </p>
            <div className="hero-actions">
              <a className="primary-button primary-login" href={dashboardHref}>
                {user ? "Intra in dashboard" : "Log in"}
              </a>
              {heroActions.map((action) => (
                <a className="secondary-button" href={action.href} key={action.label}>
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="access-panel" aria-label="Acces rapid TET-FIT">
        <div className="section-heading compact-heading">
          <p className="eyebrow">{user ? "Acces rapid" : "Start rapid"}</p>
          <h2>{accessTitle}</h2>
          <p>{accessCopy}</p>
        </div>

        <div className="access-grid">
          {accessCards.map((card) => (
            <a className="access-card" href={card.href} key={card.title}>
              <span>{card.title}</span>
              <p>{card.description}</p>
              <strong>{card.action}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="app-overview" id="app" aria-label="Descopera aplicatia">
        <div className="section-heading">
          <p className="eyebrow">Descopera aplicatia</p>
          <h2>Construita ca un dashboard de lucru, nu ca o pagina de statistici decorative.</h2>
          <p>
            TET-FIT pune in fata actiunile care conteaza: ce ai de facut, ce a fost
            completat, ce trebuie ajustat si unde apare progresul real.
          </p>
        </div>
        <div className="module-grid">
          {APP_MODULES.map((module) => (
            <article className="module-card" key={module.index}>
              <span className="feature-index">{module.index}</span>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-band" aria-label="Flux aplicatie">
        <div>
          <p className="eyebrow">Flux simplu</p>
          <h2>De la cont la plan activ in cativa pasi clari.</h2>
        </div>
        <ol className="workflow-list">
          <li>
            <strong>1. Creezi contul</strong>
            <span>Completezi profilul si obiectivul initial.</span>
          </li>
          <li>
            <strong>2. Vezi antrenorii</strong>
            <span>Alegi specialistul si pachetul potrivit.</span>
          </li>
          <li>
            <strong>3. Urmaresti progresul</strong>
            <span>Incarci rezultatele si primesti ajustari pe plan.</span>
          </li>
        </ol>
      </section>

      <section className="landing-trainers" id="trainers" aria-label="Antrenori TET-FIT">
        <div className="section-heading">
          <p className="eyebrow">Vezi antrenori</p>
          <h2>Antrenori cu profil clar, poza si zona de specializare.</h2>
          <p>
            In lista completa poti vedea pachetele disponibile si poti continua cu
            planul potrivit pentru obiectivul tau.
          </p>
        </div>
        <div className="landing-trainer-grid">
          {LANDING_TRAINERS.map((trainer) => (
            <article className="landing-trainer-card" key={trainer.name}>
              <img src={trainer.image} alt={`Portret ${trainer.name}`} />
              <div>
                <span className="trainer-role">{trainer.role}</span>
                <h3>{trainer.name}</h3>
                <p>{trainer.description}</p>
                <div className="trainer-tags" aria-label={`Specializari ${trainer.name}`}>
                  {trainer.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
        <a className="primary-button trainers-cta" href="/antrenori">
          Vezi toti antrenorii
        </a>
      </section>
    </main>
  );
}

function ExercisesPage() {
  const session = getStoredAuth();
  const user = session?.user;
  const pageSize = 10;
  const [exercises, setExercises] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [bodyPart, setBodyPart] = React.useState("toate");
  const [equipment, setEquipment] = React.useState("toate");
  const [selectedExercise, setSelectedExercise] = React.useState(null);
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [apiCursor, setApiCursor] = React.useState("");
  const [hasMoreApiPages, setHasMoreApiPages] = React.useState(true);
  const [totalExercises, setTotalExercises] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;

    async function loadFirstExercisesPage() {
      try {
        const page = await fetchExercisePageWithRetry();

        if (!isMounted) {
          return;
        }

        setExercises(page.data ?? []);
        setApiCursor(page.meta?.nextCursor ?? "");
        setHasMoreApiPages(Boolean(page.meta?.hasNextPage));
        setTotalExercises(page.meta?.total ?? page.data?.length ?? 0);
        setStatus("ready");
      } catch (exception) {
        if (!isMounted) {
          return;
        }

        setError(exception.message);
        setStatus("error");
      }
    }

    loadFirstExercisesPage();

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadNextApiPage() {
    if (!hasMoreApiPages || !apiCursor || status === "loading-more") {
      return false;
    }

    setStatus("loading-more");
    setError("");

    try {
      const page = await fetchExercisePageWithRetry(apiCursor);
      const pageExercises = page.data ?? [];

      setExercises((currentExercises) => [...currentExercises, ...pageExercises]);
      setApiCursor(page.meta?.nextCursor ?? "");
      setHasMoreApiPages(Boolean(page.meta?.hasNextPage));
      setTotalExercises(page.meta?.total ?? totalExercises);
      setStatus("ready");
      return true;
    } catch (exception) {
      setError(exception.message);
      setStatus("ready");
      return false;
    }
  }

  const bodyPartOptions = React.useMemo(
    () =>
      [
        ...new Set(
          exercises.flatMap((exercise) => exercise.bodyParts ?? []).filter(Boolean)
        ),
      ].sort(),
    [exercises]
  );

  const equipmentOptions = React.useMemo(
    () =>
      [
        ...new Set(
          exercises.flatMap((exercise) => exercise.equipments ?? []).filter(Boolean)
        ),
      ].sort(),
    [exercises]
  );

  const filteredExercises = React.useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return exercises.filter((exercise) => {
        const matchesSearch =
          !searchValue ||
          exercise.name?.toLowerCase().includes(searchValue) ||
          exercise.targetMuscles?.some((muscle) => muscle.toLowerCase().includes(searchValue));
        const matchesBodyPart =
          bodyPart === "toate" || exercise.bodyParts?.includes(bodyPart);
        const matchesEquipment =
          equipment === "toate" || exercise.equipments?.includes(equipment);

        return matchesSearch && matchesBodyPart && matchesEquipment;
      });
  }, [bodyPart, equipment, exercises, search]);

  React.useEffect(() => {
    setCurrentPage(1);
    setSelectedExercise(null);
  }, [bodyPart, equipment, search]);

  const totalLoadedPages = Math.max(1, Math.ceil(filteredExercises.length / pageSize));
  const visibleExercises = filteredExercises.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const activeExercise = selectedExercise ?? visibleExercises[0];
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalLoadedPages || hasMoreApiPages;

  async function handleNextPage() {
    if (currentPage < totalLoadedPages) {
      setCurrentPage((page) => page + 1);
      setSelectedExercise(null);
      return;
    }

    if (hasMoreApiPages) {
      const loaded = await loadNextApiPage();

      if (loaded) {
        setCurrentPage((page) => page + 1);
        setSelectedExercise(null);
      }
    }
  }

  function handlePreviousPage() {
    if (!canGoPrevious) {
      return;
    }

    setCurrentPage((page) => page - 1);
    setSelectedExercise(null);
  }

  return (
    <main className="exercises-shell">
      <nav className="topbar auth-topbar" aria-label="Navigatie exercitii">
        <a className="brand" href={getHomeHref(user)}>
          <TetFitLogo />
          <span>TET-FIT</span>
        </a>
        <div className="nav-links">
          <ClientNotificationsButton />
          <a className="nav-action" href="/dashboard">
            Dashboard
          </a>
          <a className="nav-action nav-action-strong" href="/antrenori">
            Antrenori
          </a>
        </div>
      </nav>

      <section className="exercises-header">
        <div>
          <p className="eyebrow">ExerciseDB</p>
          <h1>Biblioteca de exercitii</h1>
          <p className="dashboard-copy">
            Cauta exercitii dupa nume, grupa musculara sau echipament si vezi
            instructiunile pentru executie.
          </p>
        </div>
      </section>

      <section className="exercise-browser" aria-label="Biblioteca exercitii">
        <div className="exercise-filters">
          <label className="field">
            <span>Cauta exercitiu</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ex: bench press"
            />
          </label>

          <label className="field">
            <span>Grupa</span>
            <select value={bodyPart} onChange={(event) => setBodyPart(event.target.value)}>
              <option value="toate">Toate grupele</option>
              {bodyPartOptions.map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Echipament</span>
            <select value={equipment} onChange={(event) => setEquipment(event.target.value)}>
              <option value="toate">Orice echipament</option>
              {equipmentOptions.map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        {status === "loading" ? <p className="exercise-state">Se incarca exercitiile...</p> : null}
        {status === "error" ? <p className="form-error">{error}</p> : null}
        {error && status !== "error" ? <p className="form-error">{error}</p> : null}

        {status === "ready" || status === "loading-more" ? (
          <div className="exercise-layout">
            <div>
              <p className="exercise-count">
                Pagina {currentPage} - {visibleExercises.length} exercitii afisate. Incarcate{" "}
                {exercises.length}
                {totalExercises ? ` din ${totalExercises}` : ""}.
              </p>
              <div className="exercise-list">
                {visibleExercises.map((exercise) => (
                  <button
                    className={`exercise-card ${
                      activeExercise?.exerciseId === exercise.exerciseId ? "exercise-card-active" : ""
                    }`}
                    type="button"
                    key={exercise.exerciseId}
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    <ExerciseMedia
                      exerciseId={exercise.exerciseId}
                      gifUrl={exercise.gifUrl}
                      name={exercise.name}
                    />
                    <span>{exercise.name}</span>
                    <small>{exercise.targetMuscles?.join(", ")}</small>
                  </button>
                ))}
              </div>
              <div className="exercise-pagination">
                <button
                  className="text-button"
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={!canGoPrevious}
                >
                  Inapoi
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={handleNextPage}
                  disabled={!canGoNext || status === "loading-more"}
                >
                  {status === "loading-more" ? "Se incarca..." : "Inainte"}
                </button>
              </div>
            </div>

            <aside className="exercise-detail">
              {activeExercise ? (
                <>
                  <ExerciseMedia
                    className="exercise-detail-media"
                    exerciseId={activeExercise.exerciseId}
                    gifUrl={activeExercise.gifUrl}
                    name={activeExercise.name}
                  />
                  <span className="feature-index">{activeExercise.bodyParts?.join(", ")}</span>
                  <h2>{activeExercise.name}</h2>
                  <div className="exercise-tags">
                    {activeExercise.equipments?.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                  <div className="exercise-meta">
                    <strong>Muschi tinta</strong>
                    <p>{activeExercise.targetMuscles?.join(", ")}</p>
                  </div>
                  <div className="exercise-meta">
                    <strong>Instructiuni</strong>
                    <ol>
                      {activeExercise.instructions?.slice(0, 5).map((instruction) => (
                        <li key={instruction}>{instruction.replace(/^Step:\d+\s*/i, "")}</li>
                      ))}
                    </ol>
                  </div>
                </>
              ) : (
                <p className="exercise-state">Nu exista exercitii pentru filtrele alese.</p>
              )}
            </aside>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function ChatPanel({ currentUser, messages, onSendMessage }) {
  const [isSending, setIsSending] = React.useState(false);

  async function handleChatSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const text = formData.get("message")?.toString().trim();

    if (!text) {
      return;
    }

    setIsSending(true);

    try {
      await onSendMessage(text);
      form.reset();
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-messages" aria-label="Conversatie">
        {messages.length ? (
          messages.map((message) => (
            <div
              className={`chat-message ${
                message.senderId === currentUser.id ? "chat-message-own" : ""
              }`}
              key={message.id}
            >
              <strong>{message.senderName}</strong>
              <p>{message.text}</p>
              <span>{new Date(message.createdAt).toLocaleString("ro-RO")}</span>
            </div>
          ))
        ) : (
          <p className="chat-empty">Nu exista mesaje inca.</p>
        )}
      </div>

      <form className="chat-form" onSubmit={handleChatSubmit}>
        <label className="field">
          <span>Mesaj</span>
          <textarea
            name="message"
            placeholder="Scrie un mesaj pentru modificari, intrebari sau feedback"
            required
          />
        </label>
        <button className="primary-button login-submit" type="submit" disabled={isSending}>
          {isSending ? "Se trimite..." : "Trimite mesaj"}
        </button>
      </form>
    </div>
  );
}

function NotificationsMenu({ notifications }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [visibleNotifications, setVisibleNotifications] = React.useState(notifications);

  React.useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  function handleNotificationClick(notification) {
    dismissNotification(notification.id);
    setVisibleNotifications((currentNotifications) =>
      currentNotifications.filter((item) => item.id !== notification.id)
    );
  }

  return (
    <div className="notification-menu">
      <button className="nav-action" type="button" onClick={() => setIsOpen((open) => !open)}>
        Notificari {visibleNotifications.length ? `(${visibleNotifications.length})` : ""}
      </button>
      {isOpen ? (
        <div className="notification-dropdown">
          {visibleNotifications.length ? (
            visibleNotifications.map((notification) => (
              <a
                href={notification.href}
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
              >
                {notification.label}
              </a>
            ))
          ) : (
            <span>Nu ai notificari active.</span>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ClientNotificationsButton() {
  const session = getStoredAuth();
  const user = session?.user;
  const [notifications, setNotifications] = React.useState([]);

  React.useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      if (!user || getUserRole(user) !== "CLIENT") {
        setNotifications([]);
        return;
      }

      try {
        const [plan, assignedExercises, appointments] = await Promise.all([
          apiRequest("/api/client/plan"),
          apiRequest("/api/client/assigned-exercises"),
          apiRequest("/api/client/appointments"),
        ]);
        const messages = plan ? await apiRequest("/api/client/chat") : [];

        if (isMounted) {
          setNotifications(
            getClientNotifications(plan, messages ?? [], assignedExercises ?? [], appointments ?? [])
          );
        }
      } catch {
        if (isMounted) {
          setNotifications([]);
        }
      }
    }

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  if (!user || getUserRole(user) !== "CLIENT") {
    return null;
  }

  return <NotificationsMenu notifications={notifications} />;
}

function AppointmentRow({ appointment, action }) {
  return (
    <div className="log-item">
      <strong>{appointment.title}</strong>
      <span>
        {new Date(appointment.scheduledAt).toLocaleTimeString("ro-RO", {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        - {appointment.durationMinutes} min
      </span>
      <p>
        {appointment.clientName ? `${appointment.clientName} - ` : ""}
        {appointment.notes || appointment.status}
      </p>
      {action}
    </div>
  );
}

function groupAppointmentsByDate(appointments) {
  return appointments.reduce((groups, appointment) => {
    const date = new Date(appointment.scheduledAt).toLocaleDateString("ro-RO");
    return { ...groups, [date]: [...(groups[date] ?? []), appointment] };
  }, {});
}

function isExerciseCompleted(exercise) {
  return (
    exercise.repsPerSet?.length === exercise.setsCount &&
    exercise.weightsPerSet?.length === exercise.setsCount
  );
}

function getClientCompletionSummary(client, date = null) {
  const exercises = date
    ? getExercisesForDate(client.assignedExercises ?? [], date)
    : client.assignedExercises ?? [];
  const completedExercises = exercises.filter(isExerciseCompleted);
  return {
    total: exercises.length,
    completed: completedExercises.length,
    isComplete: exercises.length > 0 && completedExercises.length === exercises.length,
  };
}

function getExerciseDateKey(exercise) {
  return exercise.scheduledDate || toDateInputValue(new Date(exercise.assignedAt ?? Date.now()));
}

function getExercisesForDate(exercises, date) {
  const dateKey = toDateInputValue(date);
  return exercises.filter((exercise) => getExerciseDateKey(exercise) === dateKey);
}

function getDayMuscleGroups(exercises) {
  const groups = new Set();
  exercises.forEach((exercise) => {
    (exercise.muscleGroups ?? []).forEach((group) => groups.add(group));
  });
  return [...groups].join(", ") || "grupa antrenata";
}

function DayPager({ selectedDate, onSelectedDateChange, exercises, subtitle }) {
  const previousDate = addDays(selectedDate, -1);
  const nextDate = addDays(selectedDate, 1);
  const isToday = toDateInputValue(selectedDate) === toDateInputValue(new Date());
  const currentSubtitle = subtitle ?? getDayMuscleGroups(exercises);

  return (
    <div className="day-pager">
      <button className="day-nav-button" type="button" onClick={() => onSelectedDateChange(previousDate)}>
        <span>Inapoi</span>
        <strong>{previousDate.toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}</strong>
      </button>
      <div className="day-current">
        <span>{isToday ? "Azi" : "Zi selectata"}</span>
        <strong>{selectedDate.toLocaleDateString("ro-RO", { day: "numeric", month: "long" })}</strong>
        <small>{currentSubtitle}</small>
      </div>
      <button
        className="day-today-button"
        type="button"
        onClick={() => onSelectedDateChange(new Date())}
        disabled={isToday}
      >
        Azi
      </button>
      <button className="day-nav-button" type="button" onClick={() => onSelectedDateChange(nextDate)}>
        <span>Inainte</span>
        <strong>{nextDate.toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}</strong>
      </button>
    </div>
  );
}

function WeekCalendar({
  items,
  selectedDate,
  onSelectedDateChange,
  renderItem,
  emptyLabel,
  onHourSelect,
}) {
  const weekStart = getWeekStart(selectedDate);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  function getItemsForDay(day) {
    const dayKey = toDateInputValue(day);
    return items
      .filter((item) => toDateInputValue(new Date(item.scheduledAt)) === dayKey)
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  }

  return (
    <div className="outlook-calendar">
      <div className="calendar-toolbar">
        <button
          className="text-button"
          type="button"
          onClick={() => onSelectedDateChange(addDays(selectedDate, -7))}
        >
          Saptamana anterioara
        </button>
        <strong>
          {days[0].toLocaleDateString("ro-RO")} - {days[6].toLocaleDateString("ro-RO")}
        </strong>
        <button
          className="text-button"
          type="button"
          onClick={() => onSelectedDateChange(addDays(selectedDate, 7))}
        >
          Saptamana urmatoare
        </button>
      </div>
      <div className="outlook-week-scroll">
        <div className="outlook-week-grid">
          {days.map((day) => {
            const dayItems = getItemsForDay(day);

            return (
              <div className="outlook-day-column" key={day.toISOString()}>
                <button
                  className="calendar-day-header"
                  type="button"
                  onClick={() => onHourSelect?.(day)}
                >
                  <strong>{day.toLocaleDateString("ro-RO", { weekday: "short" })}</strong>
                  <span>{day.toLocaleDateString("ro-RO")}</span>
                </button>
                <div className="outlook-day-events">
                  {dayItems.length ? (
                    dayItems.map((item) => renderItem(item))
                  ) : (
                    <button
                      className="calendar-empty-slot"
                      type="button"
                      onClick={() => onHourSelect?.(day)}
                    >
                      {emptyLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getCalendarItemStyle(item) {
  const startDate = new Date(item.scheduledAt);
  const startHour = startDate.getHours() + startDate.getMinutes() / 60;
  const durationHours = Math.max((item.durationMinutes ?? 60) / 60, 0.5);
  const hourHeight = 42;
  const top = Math.max(startHour - 6, 0) * hourHeight;
  const height = Math.max(durationHours * hourHeight - 6, 34);

  return { top: `${top}px`, height: `${height}px` };
}

function getDefaultAvailabilityRange(day) {
  let slotDay = new Date(day);
  const now = new Date();
  let startHour = 9;

  if (toDateInputValue(slotDay) === toDateInputValue(now)) {
    startHour = now.getHours() + 1;

    if (startHour >= 23) {
      slotDay = addDays(slotDay, 1);
      startHour = 9;
    }
  }

  startHour = Math.max(startHour, 9);
  const endHour = Math.min(startHour + 1, 23);

  return {
    slotDate: toDateInputValue(slotDay),
    startTime: `${String(startHour).padStart(2, "0")}:00`,
    endTime: `${String(endHour).padStart(2, "0")}:00`,
  };
}

function TrainerAvailabilityPanel({ slots, onCreateSlot }) {
  const [saved, setSaved] = React.useState("");
  const [slotError, setSlotError] = React.useState("");
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(getWeekStart(new Date()));
  const [slotDate, setSlotDate] = React.useState(toDateInputValue(new Date()));
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("10:00");

  async function handleSlotSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const scheduledAt = `${slotDate}T${startTime}`;
    const start = new Date(scheduledAt);
    const end = new Date(`${slotDate}T${endTime}`);
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    setSlotError("");
    setSaved("");

    if (durationMinutes < 60) {
      setSlotError("Alege un interval de cel putin 60 de minute.");
      return;
    }

    if (durationMinutes % 60 !== 0) {
      setSlotError("Intervalul trebuie sa poata fi impartit in rezervari de 60 de minute.");
      return;
    }

    if (start < new Date()) {
      setSlotError("Alege o ora viitoare pentru disponibilitate.");
      return;
    }

    try {
      const createdSlots = await onCreateSlot({
        scheduledAt,
        durationMinutes,
        title: formData.get("title") || "Slot disponibil",
        notes: formData.get("notes"),
      });
      const slotsCount = Array.isArray(createdSlots)
        ? createdSlots.length
        : durationMinutes / 60;

      setSaved(`${slotsCount} rezervari de 60 de minute au fost deschise.`);
      form.reset();
      setIsEditorOpen(false);
    } catch (exception) {
      setSlotError(exception.message);
    }
  }

  function openAvailabilityEditor(day) {
    const defaultRange = getDefaultAvailabilityRange(day);
    setSlotDate(defaultRange.slotDate);
    setStartTime(defaultRange.startTime);
    setEndTime(defaultRange.endTime);
    setSelectedDate(getWeekStart(getDateFromInputValue(defaultRange.slotDate)));
    setSlotError("");
    setSaved("");
    setIsEditorOpen(true);
  }

  return (
    <div className="calendar-panel">
      <div className="calendar-actions">
        <button
          className="primary-button"
          type="button"
          onClick={() => setIsEditorOpen((currentValue) => !currentValue)}
        >
          {isEditorOpen ? "Inchide disponibilitatea" : "Adauga interval disponibil"}
        </button>
      </div>
      {slotError ? <p className="form-error">{slotError}</p> : null}
      {saved ? <p className="form-success">{saved}</p> : null}
      {isEditorOpen ? (
      <form className="trainer-update-form" onSubmit={handleSlotSubmit}>
        <div className="form-grid calendar-form-grid">
          <label className="field">
            <span>Ziua</span>
            <input
              type="date"
              value={slotDate}
              onChange={(event) => {
                setSlotDate(event.target.value);
                setSelectedDate(getWeekStart(new Date(`${event.target.value}T00:00`)));
              }}
              required
            />
          </label>
          <label className="field">
            <span>De la</span>
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Pana la</span>
            <input
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              required
            />
          </label>
        </div>
        <label className="field">
          <span>Titlu</span>
          <input name="title" placeholder="ex: Slot disponibil / Evaluare progres" />
        </label>
        <label className="field">
          <span>Notite</span>
          <textarea name="notes" placeholder="Detalii despre sedinta" />
        </label>
        <button className="primary-button login-submit" type="submit">
          Deschide intervalul
        </button>
      </form>
      ) : null}

      <WeekCalendar
        items={slots}
        selectedDate={selectedDate}
        onSelectedDateChange={setSelectedDate}
        emptyLabel="Liber"
        onHourSelect={openAvailabilityEditor}
        renderItem={(slot) => (
          <div
            className={`calendar-event ${
              slot.status === "REZERVAT" ? "calendar-event-client-booked" : ""
            }`}
            key={slot.id}
          >
            <div className="calendar-event-topline">
              <strong>
                {slot.status === "REZERVAT"
                  ? `Rezervat de ${slot.clientName || "client"}`
                  : "Ora libera"}
              </strong>
              <span>{slot.status === "REZERVAT" ? "Rezervat" : "Liber"}</span>
            </div>
            <span className="calendar-event-time">
              {new Date(slot.scheduledAt).toLocaleTimeString("ro-RO", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              - {slot.durationMinutes} min
            </span>
            <small>{slot.title}</small>
          </div>
        )}
      />
    </div>
  );
}

function ClientBookingPanel({ availableSlots, appointments, onBookSlot }) {
  const [bookingSlotId, setBookingSlotId] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState(getWeekStart(new Date()));
  const allCalendarItems = [
    ...availableSlots,
    ...appointments.filter(
      (appointment) => !availableSlots.some((slot) => slot.id === appointment.id)
    ),
  ];

  async function handleBook(slotId) {
    setBookingSlotId(slotId);
    await onBookSlot(slotId);
    setBookingSlotId("");
  }

  return (
    <div className="calendar-panel">
      <WeekCalendar
        items={allCalendarItems}
        selectedDate={selectedDate}
        onSelectedDateChange={setSelectedDate}
        emptyLabel="Fara programari"
        renderItem={(slot) => {
          const isAvailable = !slot.clientId && slot.status === "DISPONIBIL";
          const isOwnAppointment = appointments.some((appointment) => appointment.id === slot.id);
          const isOccupiedByOther = !isAvailable && !isOwnAppointment;
          const ownAppointmentTitle =
            isOwnAppointment && slot.title && slot.title !== "liber" ? slot.title : "Programarea ta";
          const hasAppointmentSameDay = appointments.some(
            (appointment) =>
              appointment.id !== slot.id &&
              toDateInputValue(new Date(appointment.scheduledAt)) ===
                toDateInputValue(new Date(slot.scheduledAt))
          );

          return (
            <div
              className={`calendar-event ${
                isAvailable
                  ? "calendar-event-available"
                  : isOwnAppointment
                    ? "calendar-event-own-booking"
                    : "calendar-event-booked"
              }`}
              key={slot.id}
            >
              <div className="calendar-event-topline">
                <strong>
                  {isAvailable
                    ? "Ora libera"
                    : isOwnAppointment
                      ? ownAppointmentTitle
                      : "Slot ocupat"}
                </strong>
                {!isOccupiedByOther ? (
                  <span>{isAvailable ? "Liber" : "Rezervat de tine"}</span>
                ) : null}
              </div>
              <span className="calendar-event-time">
                {new Date(slot.scheduledAt).toLocaleTimeString("ro-RO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                - {slot.durationMinutes} min
              </span>
              {isOwnAppointment ? (
                <small>
                  Ai antrenament cu {slot.trainerName}.
                </small>
              ) : null}
              {isAvailable ? (
              <button
                className="calendar-event-action"
                type="button"
                onClick={() => handleBook(slot.id)}
                disabled={bookingSlotId === slot.id}
              >
                {bookingSlotId === slot.id
                  ? "Se rezerva..."
                  : hasAppointmentSameDay
                    ? "Inlocuieste ora"
                    : "Rezerva"}
              </button>
              ) : null}
            </div>
          );
        }}
      />
      {!availableSlots.length ? <p>Antrenorul nu are sloturi disponibile momentan.</p> : null}
    </div>
  );
}

function AssignedExercisesPanel({ exercises, onSubmitResults }) {
  const [savedExerciseId, setSavedExerciseId] = React.useState("");
  const exerciseGroups = Object.values(groupAssignedExercisesByDay(exercises));

  async function handleResultsSubmit(event, assignment) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const repsPerSet = Array.from({ length: assignment.setsCount }, (_, index) =>
      Number(formData.get(`set-${index}`))
    );
    const weightsPerSet = Array.from({ length: assignment.setsCount }, (_, index) =>
      Number(formData.get(`weight-${index}`))
    );

    await onSubmitResults(assignment.id, repsPerSet, weightsPerSet);
    setSavedExerciseId(assignment.id);
  }

  if (!exercises.length) {
    return <p>Nu ai exercitii atribuite de antrenor.</p>;
  }

  return (
    <div className="assigned-exercise-list">
      {exerciseGroups.map((group) => (
        <section className="workout-day-block" key={group.dayName}>
          <div className="section-heading">
            <span className="feature-index">
              {[...group.muscleGroups].join(", ") || "Grupe stabilite de antrenor"}
            </span>
            <h2>{group.dayName}</h2>
          </div>
          {group.exercises.map((assignment) => (
            <form
              className="assigned-exercise-card"
              key={assignment.id}
              onSubmit={(event) => handleResultsSubmit(event, assignment)}
            >
              <ExerciseMedia
                exerciseId={assignment.exerciseId}
                gifUrl={assignment.gifUrl}
                name={assignment.exerciseName}
              />
              <div>
                <span className="feature-index">
                  {assignment.setsCount} serii x {assignment.minReps}-{assignment.maxReps} repetari
                </span>
                <h3>{assignment.exerciseName}</h3>
                {assignment.suggestedWeight ? (
                  <small>Greutate recomandata: {assignment.suggestedWeight} kg</small>
                ) : null}
                {assignment.notes ? <p>{assignment.notes}</p> : null}
              </div>
              <div className="set-grid">
                {Array.from({ length: assignment.setsCount }, (_, index) => (
                  <div className="set-result-pair" key={`${assignment.id}-${index}`}>
                    <label className="field">
                      <span>Seria {index + 1}</span>
                      <input
                        type="number"
                        name={`set-${index}`}
                        min="0"
                        defaultValue={assignment.repsPerSet?.[index] ?? ""}
                        placeholder="rep"
                        required
                      />
                    </label>
                    <label className="field">
                      <span>Kg</span>
                      <input
                        type="number"
                        name={`weight-${index}`}
                        min="0"
                        step="0.5"
                        defaultValue={assignment.weightsPerSet?.[index] ?? ""}
                        placeholder="kg"
                        required
                      />
                    </label>
                  </div>
                ))}
              </div>
              <button className="primary-button login-submit" type="submit">
                Salveaza repetarile
              </button>
              {savedExerciseId === assignment.id ? (
                <p className="form-success">Repetarile au fost salvate.</p>
              ) : null}
            </form>
          ))}
        </section>
      ))}
    </div>
  );
}

function AssignExerciseForm({
  clientId,
  exerciseOptions,
  scheduledDate,
  existingExercises = [],
  onAssigned,
}) {
  const [selectedExerciseId, setSelectedExerciseId] = React.useState("");
  const [exerciseSearch, setExerciseSearch] = React.useState("");
  const [aiPrompt, setAiPrompt] = React.useState("");
  const [aiSuggestion, setAiSuggestion] = React.useState(null);
  const [aiError, setAiError] = React.useState("");
  const [isGeneratingWorkout, setIsGeneratingWorkout] = React.useState(false);
  const [isAssigning, setIsAssigning] = React.useState(false);
  const [dayExercises, setDayExercises] = React.useState([]);
  const selectedWorkoutLabel = `Antrenament ${scheduledDate.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
  })}`;
  const selectedExercise = exerciseOptions.find(
    (exercise) => String(exercise.exerciseId) === String(selectedExerciseId)
  );
  const filteredExerciseOptions = React.useMemo(() => {
    const searchValue = exerciseSearch.trim().toLowerCase();

    return exerciseOptions
      .filter((exercise) => {
        if (!searchValue) {
          return true;
        }

        return (
          exercise.name?.toLowerCase().includes(searchValue) ||
          exercise.targetMuscles?.some((muscle) => muscle.toLowerCase().includes(searchValue)) ||
          exercise.bodyParts?.some((part) => part.toLowerCase().includes(searchValue))
        );
      })
      .slice(0, 120);
  }, [exerciseOptions, exerciseSearch]);

  async function handleGenerateWorkout(event) {
    event.preventDefault();
    setAiError("");
    setAiSuggestion(null);
    setIsGeneratingWorkout(true);

    try {
      const suggestion = await apiRequest(`/api/trainer/clients/${clientId}/workout-suggestions`, {
        method: "POST",
        body: JSON.stringify({
          scheduledDate: toDateInputValue(scheduledDate),
          prompt: aiPrompt,
        }),
      });
      setAiSuggestion(suggestion);
    } catch (exception) {
      setAiError(exception.message);
    } finally {
      setIsGeneratingWorkout(false);
    }
  }

  function handleAddGeneratedWorkout() {
    if (!aiSuggestion?.exercises?.length) {
      return;
    }

    setDayExercises((currentExercises) => [
      ...currentExercises,
      ...aiSuggestion.exercises.map((exercise) => ({
        localId: `${exercise.exerciseId}-${Date.now()}-${Math.random()}`,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        gifUrl: exercise.gifUrl,
        dayName: exercise.dayName,
        scheduledDate: exercise.scheduledDate,
        muscleGroups: exercise.muscleGroups ?? [],
        setsCount: exercise.setsCount,
        minReps: exercise.minReps,
        maxReps: exercise.maxReps,
        suggestedWeight: exercise.suggestedWeight,
        notes: exercise.notes,
      })),
    ]);
    setAiSuggestion(null);
  }

  function handleAddExerciseToDay(event) {
    event.preventDefault();

    if (!selectedExercise) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const exerciseDraft = {
      localId: `${selectedExercise.exerciseId}-${Date.now()}`,
      exerciseId: selectedExercise.exerciseId,
      exerciseName: selectedExercise.name,
      gifUrl: selectedExercise.gifUrl,
      dayName: selectedWorkoutLabel,
      scheduledDate: toDateInputValue(scheduledDate),
      muscleGroups: selectedExercise.bodyParts ?? selectedExercise.targetMuscles ?? [],
      setsCount: Number(formData.get("setsCount")),
      minReps: Number(formData.get("minReps")),
      maxReps: Number(formData.get("maxReps")),
      suggestedWeight: formData.get("suggestedWeight")
        ? Number(formData.get("suggestedWeight"))
        : null,
      notes: formData.get("notes"),
    };

    setDayExercises((currentExercises) => [...currentExercises, exerciseDraft]);
    setSelectedExerciseId("");
    event.currentTarget.reset();
  }

  async function handleSubmitDay() {
    if (!dayExercises.length) {
      return;
    }

    setIsAssigning(true);

    try {
      for (const exercise of dayExercises) {
        await apiRequest(`/api/trainer/clients/${clientId}/assigned-exercises`, {
          method: "POST",
          body: JSON.stringify({
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            gifUrl: exercise.gifUrl,
            dayName: exercise.dayName,
            scheduledDate: exercise.scheduledDate,
            muscleGroups: exercise.muscleGroups,
            setsCount: exercise.setsCount,
            minReps: exercise.minReps,
            maxReps: exercise.maxReps,
            suggestedWeight: exercise.suggestedWeight,
            notes: exercise.notes,
          }),
        });
      }

      setDayExercises([]);
      await onAssigned();
    } finally {
      setIsAssigning(false);
    }
  }

  return (
    <div className="trainer-update-form">
    <form className="ai-workout-panel" onSubmit={handleGenerateWorkout}>
      <div>
        <span className="feature-index">AI workout</span>
        <h3>Genereaza antrenament pentru ziua selectata</h3>
        <p>Foloseste profilul clientului, focusul planului si catalogul local de exercitii.</p>
      </div>
      {aiError ? <p className="form-error">{aiError}</p> : null}
      <label className="field">
        <span>Prompt antrenor</span>
        <textarea
          value={aiPrompt}
          onChange={(event) => setAiPrompt(event.target.value)}
          placeholder="Ex: push day, evita umeri, include gantere, accent pe forta"
        />
      </label>
      <button className="text-button login-submit" type="submit" disabled={isGeneratingWorkout}>
        {isGeneratingWorkout ? "Se genereaza..." : "Genereaza cu AI"}
      </button>
      {aiSuggestion ? (
        <div className="ai-suggestion">
          <strong>{aiSuggestion.title}</strong>
          <p>{aiSuggestion.rationale}</p>
          <div className="assigned-exercise-list compact-list">
            {aiSuggestion.exercises.map((exercise) => (
              <div className="assigned-exercise-card" key={exercise.exerciseId}>
                <ExerciseMedia
                  exerciseId={exercise.exerciseId}
                  gifUrl={exercise.gifUrl}
                  name={exercise.exerciseName}
                />
                <div>
                  <h3>{exercise.exerciseName}</h3>
                  <p>
                    {exercise.setsCount} serii x {exercise.minReps}-{exercise.maxReps} repetari
                  </p>
                  <small>{exercise.muscleGroups?.join(", ")}</small>
                </div>
              </div>
            ))}
          </div>
          <button className="primary-button login-submit" type="button" onClick={handleAddGeneratedWorkout}>
            Adauga propunerile in zi
          </button>
        </div>
      ) : null}
    </form>
    <form onSubmit={handleAddExerciseToDay}>
      <label className="field">
        <span>Cauta exercitiu</span>
        <input
          type="search"
          value={exerciseSearch}
          onChange={(event) => setExerciseSearch(event.target.value)}
          placeholder="ex: bench press, biceps, legs"
        />
      </label>
      <label className="field">
        <span>Exercitiu din catalog</span>
        <select
          value={selectedExerciseId}
          onChange={(event) => setSelectedExerciseId(event.target.value)}
          required
        >
          <option value="" disabled>
            {exerciseOptions.length ? "Alege exercitiul" : "Se incarca exercitiile..."}
          </option>
          {filteredExerciseOptions.map((exercise) => (
            <option value={exercise.exerciseId} key={exercise.exerciseId}>
              {exercise.name}
            </option>
          ))}
        </select>
      </label>
      <p className="exercise-count">
        {filteredExerciseOptions.length} rezultate afisate din {exerciseOptions.length} exercitii stocate.
      </p>
      {selectedExercise ? (
        <div className="log-item selected-exercise-preview">
          <strong>{selectedExercise.name}</strong>
          <span>
            {[...(selectedExercise.bodyParts ?? []), ...(selectedExercise.targetMuscles ?? [])]
              .filter(Boolean)
              .join(", ") || "Fara grupe in catalog"}
          </span>
        </div>
      ) : null}
      <div className="set-grid">
        <label className="field">
          <span>Serii</span>
          <input type="number" name="setsCount" min="1" max="12" required />
        </label>
        <label className="field">
          <span>Rep min</span>
          <input type="number" name="minReps" min="1" max="100" required />
        </label>
        <label className="field">
          <span>Rep max</span>
          <input type="number" name="maxReps" min="1" max="100" required />
        </label>
        <label className="field">
          <span>Kg recomandate</span>
          <input type="number" name="suggestedWeight" min="0" step="0.5" placeholder="optional" />
        </label>
      </div>
      <label className="field">
        <span>Indicatii</span>
        <textarea name="notes" placeholder="Tempo, pauza, RIR sau observatii tehnice" />
      </label>
      <button
        className="text-button login-submit"
        type="submit"
        disabled={!selectedExercise}
      >
        Adauga in zi
      </button>
    </form>
      <div className="day-builder">
        <span className="feature-index">Zi in lucru</span>
        <h3>{selectedWorkoutLabel}</h3>
        {existingExercises.length ? (
          <p>
            Ai {existingExercises.length} exercitii salvate pentru ziua selectata.
            Exercitiile noi apar aici pana le salvezi.
          </p>
        ) : null}
        {dayExercises.length ? (
          <div className="assigned-exercise-list compact-list">
            {dayExercises.map((exercise) => (
              <div className="assigned-exercise-card" key={exercise.localId}>
                <ExerciseMedia
                  exerciseId={exercise.exerciseId}
                  gifUrl={exercise.gifUrl}
                  name={exercise.exerciseName}
                />
                <div>
                  <h3>{exercise.exerciseName}</h3>
                  <p>
                    {exercise.setsCount} serii x {exercise.minReps}-{exercise.maxReps} repetari
                  </p>
                  {exercise.suggestedWeight ? (
                    <small>Recomandat: {exercise.suggestedWeight} kg</small>
                  ) : null}
                  {exercise.notes ? <small>{exercise.notes}</small> : null}
                </div>
                <button
                  className="text-button danger-button full-span"
                  type="button"
                  onClick={() =>
                    setDayExercises((currentExercises) =>
                      currentExercises.filter((item) => item.localId !== exercise.localId)
                    )
                  }
                >
                  Scoate din zi
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>Nu ai exercitii noi de salvat in acest moment.</p>
        )}
        <button
          className="primary-button login-submit"
          type="button"
          onClick={handleSubmitDay}
          disabled={!dayExercises.length || isAssigning}
        >
          {isAssigning ? "Se salveaza..." : "Salveaza ziua de antrenament"}
        </button>
      </div>
    </div>
  );
}

function TrainerAssignedExerciseCard({ assignment, onUpdated }) {
  async function handleUpdate(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    await apiRequest(`/api/trainer/assigned-exercises/${assignment.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        dayName: formData.get("dayName"),
        muscleGroups: assignment.muscleGroups ?? [],
        setsCount: Number(formData.get("setsCount")),
        minReps: Number(formData.get("minReps")),
        maxReps: Number(formData.get("maxReps")),
        suggestedWeight: formData.get("suggestedWeight")
          ? Number(formData.get("suggestedWeight"))
          : null,
        notes: formData.get("notes"),
      }),
    });

    await onUpdated();
  }

  async function handleDelete() {
    await apiRequest(`/api/trainer/assigned-exercises/${assignment.id}`, {
      method: "DELETE",
    });

    await onUpdated();
  }

  return (
    <form className="assigned-exercise-card" onSubmit={handleUpdate}>
      <ExerciseMedia
        exerciseId={assignment.exerciseId}
        gifUrl={assignment.gifUrl}
        name={assignment.exerciseName}
      />
      <div>
        <span className="feature-index">
          {assignment.dayName || "Ziua de antrenament"}
        </span>
        <h3>{assignment.exerciseName}</h3>
        {assignment.repsPerSet?.length ? (
          <small>
            Realizat:{" "}
            {assignment.repsPerSet
              .map((reps, index) => `${reps} rep x ${assignment.weightsPerSet?.[index] ?? 0} kg`)
              .join(" / ")}
          </small>
        ) : (
          <small>Clientul nu a completat inca repetarile.</small>
        )}
      </div>
      <div className="set-grid">
        <label className="field">
          <span>Zi</span>
          <input name="dayName" defaultValue={assignment.dayName ?? "Ziua de antrenament"} required />
        </label>
        <label className="field">
          <span>Serii</span>
          <input
            type="number"
            name="setsCount"
            min="1"
            max="12"
            defaultValue={assignment.setsCount}
            required
          />
        </label>
        <label className="field">
          <span>Rep min</span>
          <input
            type="number"
            name="minReps"
            min="1"
            max="100"
            defaultValue={assignment.minReps}
            required
          />
        </label>
        <label className="field">
          <span>Rep max</span>
          <input
            type="number"
            name="maxReps"
            min="1"
            max="100"
            defaultValue={assignment.maxReps}
            required
          />
        </label>
        <label className="field">
          <span>Kg recomandate</span>
          <input
            type="number"
            name="suggestedWeight"
            min="0"
            step="0.5"
            defaultValue={assignment.suggestedWeight ?? ""}
          />
        </label>
      </div>
      <label className="field full-span">
        <span>Indicatii</span>
        <textarea name="notes" defaultValue={assignment.notes ?? ""} />
      </label>
      <div className="button-row">
        <button className="primary-button" type="submit">
          Modifica
        </button>
        <button className="text-button danger-button" type="button" onClick={handleDelete}>
          Sterge
        </button>
      </div>
    </form>
  );
}

function ClientWorkoutSummary({ client, selectedDate }) {
  const dayExercises = selectedDate
    ? getExercisesForDate(client.assignedExercises ?? [], selectedDate)
    : client.assignedExercises ?? [];
  const exerciseGroups = Object.values(groupAssignedExercisesByDay(dayExercises));
  const summary = {
    total: dayExercises.length,
    completed: dayExercises.filter(isExerciseCompleted).length,
    isComplete: dayExercises.length > 0 && dayExercises.every(isExerciseCompleted),
  };

  return (
    <section className="workout-summary">
      <div className="summary-header">
        <span className={summary.isComplete ? "summary-pill done" : "summary-pill pending"}>
          {summary.completed}/{summary.total} completate
        </span>
        <strong>Rezumat antrenament</strong>
      </div>
      {exerciseGroups.length ? (
        exerciseGroups.map((group) => (
          <div className="summary-day" key={group.dayName}>
            <h3>{group.dayName}</h3>
            {group.exercises.map((exercise) => (
              <div
                className={`summary-exercise ${
                  isExerciseCompleted(exercise) ? "summary-exercise-done" : ""
                }`}
                key={exercise.id}
              >
                <span>{isExerciseCompleted(exercise) ? "✓" : "x"}</span>
                <div>
                  <strong>{exercise.exerciseName}</strong>
                  <small>
                    Prescris: {exercise.setsCount} x {exercise.minReps}-{exercise.maxReps}
                    {exercise.suggestedWeight ? `, ${exercise.suggestedWeight} kg recomandat` : ""}
                  </small>
                  {exercise.repsPerSet?.length ? (
                    <small>
                      Realizat:{" "}
                      {exercise.repsPerSet
                        .map(
                          (reps, index) =>
                            `${reps} rep x ${exercise.weightsPerSet?.[index] ?? 0} kg`
                        )
                        .join(" / ")}
                    </small>
                  ) : (
                    <small>Necompletat de client.</small>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))
      ) : (
        <p>Nu exista exercitii atribuite.</p>
      )}
    </section>
  );
}

function getCompletedExerciseResults(exercises) {
  return (exercises ?? [])
    .filter(isExerciseCompleted)
    .map((exercise) => {
      const reps = exercise.repsPerSet ?? [];
      const weights = exercise.weightsPerSet ?? [];
      const completedAt = new Date(
        exercise.scheduledDate
          ? `${exercise.scheduledDate}T00:00`
          : exercise.updatedAt ?? exercise.assignedAt ?? Date.now()
      );
      const totalReps = reps.reduce((sum, value) => sum + Number(value ?? 0), 0);
      const totalVolume = reps.reduce(
        (sum, value, index) => sum + Number(value ?? 0) * Number(weights[index] ?? 0),
        0
      );
      const maxWeight = weights.length ? Math.max(...weights.map((value) => Number(value ?? 0))) : 0;
      const averageWeight = weights.length
        ? weights.reduce((sum, value) => sum + Number(value ?? 0), 0) / weights.length
        : 0;

      return {
        id: exercise.id,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        dayName: exercise.dayName,
        date: completedAt,
        dateKey: toDateInputValue(completedAt),
        totalReps,
        totalVolume,
        maxWeight,
        averageWeight,
        setsCount: exercise.setsCount,
        sets: reps.map((rep, index) => ({
          setIndex: index + 1,
          reps: Number(rep ?? 0),
          weight: Number(weights[index] ?? 0),
          performanceScore: Number(weights[index] ?? 0) * (1 + Number(rep ?? 0) / 30),
        })),
        setBreakdown: reps
          .map((rep, index) => `${rep} x ${weights[index] ?? 0} kg`)
          .join(" / "),
      };
    })
    .sort((a, b) => a.date - b.date);
}

function getWorkoutProgressByDay(results) {
  const groups = results.reduce((currentGroups, result) => {
    const currentGroup = currentGroups[result.dateKey] ?? {
      date: result.date,
      dateKey: result.dateKey,
      totalReps: 0,
      totalVolume: 0,
      maxWeight: 0,
      completedExercises: 0,
      exerciseNames: new Set(),
      dayNames: new Set(),
    };

    currentGroup.totalReps += result.totalReps;
    currentGroup.totalVolume += result.totalVolume;
    currentGroup.maxWeight = Math.max(currentGroup.maxWeight, result.maxWeight);
    currentGroup.completedExercises += 1;
    currentGroup.exerciseNames.add(result.exerciseName);
    if (result.dayName) {
      currentGroup.dayNames.add(result.dayName);
    }

    return { ...currentGroups, [result.dateKey]: currentGroup };
  }, {});

  return Object.values(groups)
    .map((group) => ({
      ...group,
      exerciseNames: [...group.exerciseNames],
      dayNames: [...group.dayNames],
      dayName: [...group.dayNames][0] ?? null,
    }))
    .sort((a, b) => a.date - b.date);
}

function getExerciseSetProgressPoints(results, selectedExerciseKey) {
  return results
    .filter((result) => (result.exerciseId || result.exerciseName) === selectedExerciseKey)
    .flatMap((result) =>
      (result.sets ?? []).map((set) => ({
        ...set,
        exerciseName: result.exerciseName,
        date: result.date,
        dateKey: result.dateKey,
      }))
    )
    .sort((a, b) => a.date - b.date || a.setIndex - b.setIndex);
}

function getBestSetByDate(points) {
  const bestByDate = points.reduce((groups, point) => {
    const currentPoint = groups[point.dateKey];

    if (!currentPoint || point.performanceScore > currentPoint.performanceScore) {
      return { ...groups, [point.dateKey]: point };
    }

    return groups;
  }, {});

  return Object.values(bestByDate).sort((a, b) => a.date - b.date);
}

function getProgressPeriodStart(date, period) {
  const periodStart = new Date(date);
  periodStart.setHours(0, 0, 0, 0);

  if (period === "month") {
    periodStart.setDate(1);
    return periodStart;
  }

  return getWeekStart(periodStart);
}

function getProgressPeriodLabel(date, period) {
  if (period === "month") {
    return date.toLocaleDateString("ro-RO", { month: "short", year: "numeric" });
  }

  const weekEnd = addDays(date, 6);
  return `${date.toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit" })}-${weekEnd.toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit" })}`;
}

function getProgressSessionSummary(point) {
  const exerciseNames = point.exerciseNames ?? (point.exerciseName ? [point.exerciseName] : []);
  const dayName = (point.dayNames?.[0] ?? point.dayName ?? "").replace(
    /^Ziua\s+\d+\s+-\s*/i,
    ""
  );

  return {
    date: point.date,
    dateKey: toDateInputValue(point.date),
    dayName,
    exerciseName: point.exerciseName,
    completedExercises: Number(point.completedExercises ?? (point.exerciseName ? 1 : 0)),
    setBreakdown: point.setBreakdown,
    exerciseNames,
  };
}

function aggregateProgressByPeriod(points, period) {
  const groups = points.reduce((currentGroups, point) => {
    const periodStart = getProgressPeriodStart(point.date, period);
    const periodKey = toDateInputValue(periodStart);
    const currentGroup = currentGroups[periodKey] ?? {
      date: periodStart,
      dateKey: periodKey,
      label: getProgressPeriodLabel(periodStart, period),
      totalReps: 0,
      totalVolume: 0,
      maxWeight: 0,
      completedExercises: 0,
      exerciseNames: new Set(),
      sourceDates: new Set(),
      sessionSummaries: [],
    };

    currentGroup.totalReps += Number(point.totalReps ?? 0);
    currentGroup.totalVolume += Number(point.totalVolume ?? 0);
    currentGroup.maxWeight = Math.max(currentGroup.maxWeight, Number(point.maxWeight ?? 0));
    currentGroup.completedExercises += Number(point.completedExercises ?? 1);
    (point.exerciseNames ?? [point.exerciseName]).filter(Boolean).forEach((name) => {
      currentGroup.exerciseNames.add(name);
    });
    currentGroup.sourceDates.add(toDateInputValue(point.date));
    currentGroup.sessionSummaries.push(getProgressSessionSummary(point));

    return { ...currentGroups, [periodKey]: currentGroup };
  }, {});

  return Object.values(groups)
    .map((group) => ({
      ...group,
      exerciseNames: [...group.exerciseNames],
      sessionsCount: group.sourceDates.size,
      sessionSummaries: group.sessionSummaries.sort((a, b) => a.date - b.date),
    }))
    .sort((a, b) => a.date - b.date);
}

function getMetricLabel(metric) {
  const labels = {
    totalVolume: "Volum",
    totalReps: "Repetari",
    maxWeight: "Greutate max",
    completedExercises: "Exercitii",
    calories: "kcal",
    protein: "Proteine",
    carbs: "Carbohidrati",
    fats: "Grasimi",
    weight: "Greutate",
  };
  return labels[metric] ?? "Valoare";
}

function formatProgressValue(value, metric) {
  if (["calories", "protein", "carbs", "fats", "weight"].includes(metric)) {
    return formatNutritionValue(value, metric);
  }
  if (metric === "totalVolume") {
    return `${Math.round(value)} kg`;
  }
  if (metric === "maxWeight") {
    return `${Number(value).toFixed(value % 1 === 0 ? 0 : 1)} kg`;
  }
  return `${Math.round(value)}`;
}

function shortenChartText(text, maxLength = 28) {
  if (!text || text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function getChartActivityLabel(summary) {
  const dateLabel = summary.date.toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
  });

  if (summary.setBreakdown) {
    return `${dateLabel} ${shortenChartText(summary.setBreakdown, 30)}`;
  }

  const label =
    summary.dayName ||
    summary.exerciseName ||
    summary.exerciseNames?.slice(0, 2).join(", ") ||
    `${summary.completedExercises} exercitii`;

  return `${dateLabel} ${shortenChartText(label, 30)}`;
}

function getProgressActivityLines(point, maxLines) {
  const sessionSummaries = point.sessionSummaries ?? [];
  const uniqueSummaries = [];
  const seenKeys = new Set();

  sessionSummaries.forEach((summary) => {
    const key = `${summary.dateKey}-${summary.dayName || summary.exerciseName || summary.setBreakdown}`;

    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueSummaries.push(summary);
    }
  });

  return uniqueSummaries.slice(0, maxLines).map(getChartActivityLabel);
}

function ProgressTrendChart({ points, metric }) {
  const width = 720;
  const height = 360;
  const padding = { top: 42, right: 34, bottom: 122, left: 64 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = points.map((point) => Number(point[metric] ?? 0));
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = Math.max(maxValue - minValue, 1);
  const firstValue = values[0] ?? 0;
  const lastValue = values[values.length - 1] ?? 0;
  const progressPercent = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  const prIndex = values.indexOf(maxValue);

  function getX(index) {
    if (points.length === 1) {
      return padding.left + chartWidth / 2;
    }
    return padding.left + (index / (points.length - 1)) * chartWidth;
  }

  function getY(value) {
    return padding.top + chartHeight - ((value - minValue) / range) * chartHeight;
  }

  function getLabelAnchor(x) {
    if (x < padding.left + 95) {
      return "start";
    }
    if (x > width - padding.right - 95) {
      return "end";
    }
    return "middle";
  }

  const path = points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${getX(index)} ${getY(Number(point[metric] ?? 0))}`;
    })
    .join(" ");

  if (!points.length) {
    return <p className="exercise-state">Nu exista date pentru grafic.</p>;
  }

  return (
    <div className="progress-line-chart" aria-label={`Grafic ${getMetricLabel(metric)} in timp`}>
      <div className="chart-progress-badge">
        <span>Progres fata de prima valoare</span>
        <strong className={progressPercent >= 0 ? "positive-delta" : "negative-delta"}>
          {progressPercent > 0 ? "+" : ""}
          {progressPercent.toFixed(1)}%
        </strong>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={height - padding.bottom}
          y2={height - padding.bottom}
        />
        <line
          x1={padding.left}
          x2={padding.left}
          y1={padding.top}
          y2={height - padding.bottom}
        />
        {[0, 0.5, 1].map((ratio) => {
          const value = minValue + range * ratio;
          const y = getY(value);
          return (
            <g key={ratio}>
              <line
                className="chart-grid-line"
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
              />
              <text x={padding.left - 10} y={y + 4} textAnchor="end">
                {formatProgressValue(value, metric)}
              </text>
            </g>
          );
        })}
        <path d={path} />
        {points.map((point, index) => {
          const value = Number(point[metric] ?? 0);
          const x = getX(index);
          const y = getY(value);
          const isPr = index === prIndex;
          const percentFromFirst = firstValue > 0 ? ((value - firstValue) / firstValue) * 100 : 0;
          const maxActivityLines = points.length <= 2 ? 5 : 2;
          const activityLines = getProgressActivityLines(point, maxActivityLines);
          const hiddenActivityCount = Math.max(
            (point.sessionSummaries?.length ?? 0) - activityLines.length,
            0
          );
          const activityTitle = getProgressActivityLines(point, 8).join(" | ");
          const labelAnchor = getLabelAnchor(x);

          return (
            <g key={`${point.dateKey}-${index}`}>
              <circle className={isPr ? "chart-pr-point" : ""} cx={x} cy={y} r={isPr ? "8" : "5"} />
              <text
                className={isPr ? "chart-pr-label" : "chart-point-value"}
                x={x}
                y={y - 12}
                textAnchor="middle"
              >
                {isPr ? `PR ${formatProgressValue(value, metric)}` : formatProgressValue(value, metric)}
              </text>
              <text x={x} y={height - padding.bottom + 22} textAnchor={labelAnchor}>
                {point.label ??
                  point.date.toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit" })}
              </text>
              {activityLines.length ? (
                <g className="chart-activity-label">
                  {activityLines.map((line, lineIndex) => (
                    <text
                      className="chart-activity-text"
                      x={x}
                      y={height - padding.bottom + 42 + lineIndex * 15}
                      textAnchor={labelAnchor}
                      key={line}
                    >
                      {line}
                    </text>
                  ))}
                  {hiddenActivityCount ? (
                    <text
                      className="chart-activity-more"
                      x={x}
                      y={height - padding.bottom + 42 + activityLines.length * 15}
                      textAnchor={labelAnchor}
                    >
                      +{hiddenActivityCount} in istoric
                    </text>
                  ) : null}
                </g>
              ) : null}
              <title>
                {point.label ?? point.date.toLocaleDateString("ro-RO")} - {formatProgressValue(
                  value,
                  metric
                )} ({percentFromFirst > 0 ? "+" : ""}
                {percentFromFirst.toFixed(1)}% fata de prima valoare)
                {activityTitle ? ` - ${activityTitle}` : ""}
              </title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ProgressScatterChart({ points }) {
  const width = 720;
  const height = 280;
  const padding = { top: 28, right: 34, bottom: 58, left: 62 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const repsValues = points.map((point) => Number(point.reps ?? 0));
  const weightValues = points.map((point) => Number(point.weight ?? 0));
  const minReps = Math.min(...repsValues, 0);
  const maxReps = Math.max(...repsValues, 1);
  const minWeight = Math.min(...weightValues, 0);
  const maxWeight = Math.max(...weightValues, 1);
  const repsRange = Math.max(maxReps - minReps, 1);
  const weightRange = Math.max(maxWeight - minWeight, 1);
  const latestDateKey = points[points.length - 1]?.dateKey;
  const progressPoints = getBestSetByDate(points);
  const progressPath = progressPoints
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${getX(point.reps)} ${getY(point.weight)}`;
    })
    .join(" ");

  function getX(reps) {
    return padding.left + ((Number(reps ?? 0) - minReps) / repsRange) * chartWidth;
  }

  function getY(weight) {
    return padding.top + chartHeight - ((Number(weight ?? 0) - minWeight) / weightRange) * chartHeight;
  }

  if (!points.length) {
    return <p className="exercise-state">Nu exista serii completate pentru grafic.</p>;
  }

  return (
    <div
      className="progress-line-chart progress-scatter-chart"
      aria-label="Grafic repetari in functie de greutate"
    >
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={height - padding.bottom}
          y2={height - padding.bottom}
        />
        <line
          x1={padding.left}
          x2={padding.left}
          y1={padding.top}
          y2={height - padding.bottom}
        />
        {[0, 0.5, 1].map((ratio) => {
          const weight = minWeight + weightRange * ratio;
          const y = getY(weight);
          return (
            <g key={`kg-${ratio}`}>
              <line
                className="chart-grid-line"
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
              />
              <text x={padding.left - 10} y={y + 4} textAnchor="end">
                {formatProgressValue(weight, "maxWeight")}
              </text>
            </g>
          );
        })}
        {[0, 0.5, 1].map((ratio) => {
          const reps = minReps + repsRange * ratio;
          const x = getX(reps);
          return (
            <g key={`reps-${ratio}`}>
              <line
                className="chart-grid-line"
                x1={x}
                x2={x}
                y1={padding.top}
                y2={height - padding.bottom}
              />
              <text x={x} y={height - 22} textAnchor="middle">
                {Math.round(reps)} rep
              </text>
            </g>
          );
        })}
        <text className="chart-axis-label" x={width / 2} y={height - 6} textAnchor="middle">
          Repetari pe serie
        </text>
        <text
          className="chart-axis-label"
          x={18}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90 18 ${height / 2})`}
        >
          Greutate
        </text>
        {progressPoints.length > 1 ? (
          <path className="scatter-progress-line" d={progressPath} />
        ) : null}
        {points.map((point, index) => {
          const x = getX(point.reps);
          const y = getY(point.weight);
          const isLatest = point.dateKey === latestDateKey;
          const isProgressPoint = progressPoints.some(
            (progressPoint) =>
              progressPoint.dateKey === point.dateKey &&
              progressPoint.setIndex === point.setIndex &&
              progressPoint.reps === point.reps &&
              progressPoint.weight === point.weight
          );
          return (
            <g key={`${point.dateKey}-${point.setIndex}-${index}`}>
              <circle
                className={[
                  isProgressPoint ? "scatter-progress-point" : "",
                  isLatest ? "scatter-latest-point" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                cx={x}
                cy={y}
                r={isProgressPoint || isLatest ? "7" : "5"}
              />
              {isProgressPoint || isLatest ? (
                <text className="chart-point-value" x={x} y={y - 11} textAnchor="middle">
                  {point.date.toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit" })}
                </text>
              ) : null}
              <title>
                {point.date.toLocaleDateString("ro-RO")} - seria {point.setIndex}: {point.reps} rep
                x {point.weight} kg
              </title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ClientProgressPanel({ client }) {
  const results = React.useMemo(
    () => getCompletedExerciseResults(client.assignedExercises ?? []),
    [client.assignedExercises]
  );
  const exerciseOptions = React.useMemo(() => {
    const options = new Map();
    results.forEach((result) => {
      const key = result.exerciseId || result.exerciseName;
      if (!options.has(key)) {
        options.set(key, {
          key,
          label: result.exerciseName,
          count: 0,
        });
      }
      options.get(key).count += 1;
    });
    return [...options.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [results]);
  const [viewMode, setViewMode] = React.useState("exercise");
  const [period, setPeriod] = React.useState("week");
  const [metric, setMetric] = React.useState("maxWeight");
  const [selectedExerciseKey, setSelectedExerciseKey] = React.useState("");

  React.useEffect(() => {
    if (!selectedExerciseKey && exerciseOptions.length) {
      setSelectedExerciseKey(exerciseOptions[0].key);
    }
  }, [exerciseOptions, selectedExerciseKey]);

  React.useEffect(() => {
    if (viewMode === "workout" && metric === "maxWeight") {
      setMetric("totalVolume");
    }
    if (viewMode === "exercise" && metric === "completedExercises") {
      setMetric("maxWeight");
    }
  }, [metric, viewMode]);

  const exercisePoints = results.filter(
    (result) => (result.exerciseId || result.exerciseName) === selectedExerciseKey
  );
  const workoutPoints = getWorkoutProgressByDay(results);
  const chartPoints = aggregateProgressByPeriod(
    viewMode === "exercise" ? exercisePoints : workoutPoints,
    period
  );
  const latestPoint = chartPoints[chartPoints.length - 1];
  const previousPoint = chartPoints[chartPoints.length - 2];
  const firstPoint = chartPoints[0];
  const metricDelta =
    latestPoint && previousPoint
      ? Number(latestPoint[metric] ?? 0) - Number(previousPoint[metric] ?? 0)
      : null;
  const progressPercent =
    firstPoint && latestPoint && Number(firstPoint[metric] ?? 0) > 0
      ? ((Number(latestPoint[metric] ?? 0) - Number(firstPoint[metric] ?? 0)) /
          Number(firstPoint[metric] ?? 0)) *
        100
      : null;
  const metricOptions =
    viewMode === "exercise"
      ? ["maxWeight", "totalVolume", "totalReps"]
      : ["totalVolume", "totalReps", "completedExercises"];

  if (!results.length) {
    return (
      <section className="progress-history-panel">
        <div className="section-heading">
          <span className="feature-index">Evolutie client</span>
          <h2>Progres in timp</h2>
        </div>
        <p>Clientul nu are inca exercitii completate cu repetari si greutati.</p>
      </section>
    );
  }

  return (
    <section className="progress-history-panel">
      <div className="section-heading progress-history-header">
        <div>
          <span className="feature-index">Evolutie client</span>
          <h2>Progres in timp</h2>
        </div>
        <div className="progress-history-actions">
          <a
            className="text-button history-jump-button"
            href={`/antrenor-client-istoric?clientId=${client.clientId}`}
          >
            Istoric
          </a>
          <div className="segmented-control" aria-label="Tip grafic progres">
            <button
              className={viewMode === "exercise" ? "segmented-active" : ""}
              type="button"
              onClick={() => setViewMode("exercise")}
            >
              Pe exercitiu
            </button>
            <button
              className={viewMode === "workout" ? "segmented-active" : ""}
              type="button"
              onClick={() => setViewMode("workout")}
            >
              Pe antrenament
            </button>
          </div>
        </div>
      </div>

      <div className="progress-history-controls">
        {viewMode === "exercise" ? (
          <label className="field">
            <span>Exercitiu urmarit</span>
            <select
              value={selectedExerciseKey}
              onChange={(event) => setSelectedExerciseKey(event.target.value)}
            >
              {exerciseOptions.map((option) => (
                <option value={option.key} key={option.key}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="segmented-control" aria-label="Perioada grafic progres">
          <button
            className={period === "week" ? "segmented-active" : ""}
            type="button"
            onClick={() => setPeriod("week")}
          >
            Saptamani
          </button>
          <button
            className={period === "month" ? "segmented-active" : ""}
            type="button"
            onClick={() => setPeriod("month")}
          >
            Luni
          </button>
        </div>
        <div className="metric-toggle" aria-label="Metrici progres">
          {metricOptions.map((option) => (
            <button
              className={metric === option ? "metric-active" : ""}
              type="button"
              key={option}
              onClick={() => setMetric(option)}
            >
              {getMetricLabel(option)}
            </button>
          ))}
        </div>
      </div>

      <div className="progress-history-stats">
        <div>
          <span>{period === "week" ? "Saptamani in grafic" : "Luni in grafic"}</span>
          <strong>{chartPoints.length}</strong>
        </div>
        <div>
          <span>Ultima valoare</span>
          <strong>{latestPoint ? formatProgressValue(latestPoint[metric], metric) : "-"}</strong>
        </div>
        <div>
          <span>Progres fata de prima valoare</span>
          <strong className={progressPercent >= 0 ? "positive-delta" : "negative-delta"}>
            {progressPercent === null
              ? "-"
              : `${progressPercent > 0 ? "+" : ""}${progressPercent.toFixed(1)}%`}
          </strong>
        </div>
      </div>

      <ProgressTrendChart points={chartPoints} metric={metric} />
    </section>
  );
}

function ClientWorkoutHistoryList({ client }) {
  const results = React.useMemo(
    () => getCompletedExerciseResults(client.assignedExercises ?? []),
    [client.assignedExercises]
  );
  const workoutPoints = getWorkoutProgressByDay(results).sort((a, b) => b.date - a.date);

  if (!workoutPoints.length) {
    return <p>Clientul nu are inca antrenamente completate.</p>;
  }

  return (
    <div className="progress-history-list history-page-list">
      {workoutPoints.map((point) => (
        <div className="log-item" key={point.dateKey}>
          <strong>{point.date.toLocaleDateString("ro-RO")}</strong>
          <span>{point.completedExercises} exercitii completate</span>
          {point.dayName ? <small>{point.dayName}</small> : null}
          <small>
            {point.exerciseNames.slice(0, 5).join(", ")}
            {point.exerciseNames.length > 5 ? "..." : ""}
          </small>
          <p>
            Volum {Math.round(point.totalVolume)} kg, greutate maxima{" "}
            {formatProgressValue(point.maxWeight, "maxWeight")}, {point.totalReps} repetari.
          </p>
        </div>
      ))}
    </div>
  );
}

function ClientNutritionHistoryList({ logs = [] }) {
  const sortedLogs = sortNutritionLogs(logs).reverse();

  if (!sortedLogs.length) {
    return <p>Clientul nu are inca loguri nutritionale.</p>;
  }

  return (
    <div className="nutrition-history-list">
      {sortedLogs.map((log) => (
        <div className="log-item nutrition-history-item" key={log.id ?? log.date}>
          <strong>{getDateFromInputValue(log.date).toLocaleDateString("ro-RO")}</strong>
          <span>{formatNutritionValue(log.calories, "calories")}</span>
          <small>
            P {formatNutritionValue(log.protein, "protein")} / C{" "}
            {formatNutritionValue(log.carbs, "carbs")} / G{" "}
            {formatNutritionValue(log.fats, "fats")}
          </small>
          {log.weight ? <small>Greutate: {formatNutritionValue(log.weight, "weight")}</small> : null}
          {log.notes ? <p>{log.notes}</p> : null}
        </div>
      ))}
    </div>
  );
}

function NutritionTargetSummary({ target }) {
  if (!target) {
    return (
      <div className="nutrition-empty">
        <strong>Nu exista target nutritional setat.</strong>
        <p>Antrenorul poate salva o recomandare de kcal si macros dupa completarea profilului.</p>
      </div>
    );
  }

  return (
    <div className="nutrition-target-grid" aria-label="Target nutritional">
      <div>
        <span>kcal</span>
        <strong>{formatNutritionValue(target.calories, "calories")}</strong>
      </div>
      <div>
        <span>Proteine</span>
        <strong>{formatNutritionValue(target.protein, "protein")}</strong>
      </div>
      <div>
        <span>Carbohidrati</span>
        <strong>{formatNutritionValue(target.carbs, "carbs")}</strong>
      </div>
      <div>
        <span>Grasimi</span>
        <strong>{formatNutritionValue(target.fats, "fats")}</strong>
      </div>
      {target.notes ? <p>{target.notes}</p> : null}
    </div>
  );
}

function WeightGoalSummary({ profile, suggestion }) {
  const summary = getWeightGoalSummary(profile);

  if (!summary) {
    return null;
  }

  return (
    <div className="nutrition-goal-grid" aria-label="Obiectiv greutate">
      <div>
        <span>Greutate curenta</span>
        <strong>{formatNutritionValue(summary.currentWeight, "weight")}</strong>
      </div>
      <div>
        <span>Greutate tinta</span>
        <strong>{formatNutritionValue(summary.targetWeight, "weight")}</strong>
      </div>
      <div>
        <span>Diferenta</span>
        <strong>{summary.delta === null ? "-" : formatSignedWeight(summary.delta)}</strong>
      </div>
      <div>
        <span>Termen</span>
        <strong>{formatProfileTargetDate(summary.targetDate)}</strong>
      </div>
      {suggestion?.targetPaceNote ? <p>{suggestion.targetPaceNote}</p> : null}
    </div>
  );
}

function NutritionTrendPanel({ logs, target, profile }) {
  const availableMetrics = React.useMemo(() => {
    const hasWeight = logs.some((log) => log.weight !== null && log.weight !== undefined);
    return hasWeight
      ? NUTRITION_METRICS
      : NUTRITION_METRICS.filter((metric) => metric.key !== "weight");
  }, [logs]);
  const [metric, setMetric] = React.useState("calories");

  React.useEffect(() => {
    if (!availableMetrics.some((item) => item.key === metric)) {
      setMetric(availableMetrics[0]?.key ?? "calories");
    }
  }, [availableMetrics, metric]);

  const chartPoints = buildNutritionChartPoints(logs, metric);
  const latestPoint = chartPoints[chartPoints.length - 1];
  const targetValue = metric === "weight" ? profile?.targetWeight : target?.[metric];

  return (
    <section className="nutrition-chart-panel">
      <div className="progress-history-header">
        <div>
          <span className="feature-index">Evolutie nutritionala</span>
          <h3>{getNutritionMetric(metric).label}</h3>
        </div>
        <div className="metric-toggle" aria-label="Metrici nutritionale">
          {availableMetrics.map((option) => (
            <button
              className={metric === option.key ? "metric-active" : ""}
              key={option.key}
              type="button"
              onClick={() => setMetric(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="progress-history-stats nutrition-stats">
        <div>
          <span>Zile logate</span>
          <strong>{logs.length}</strong>
        </div>
        <div>
          <span>Ultima valoare</span>
          <strong>{latestPoint ? formatNutritionValue(latestPoint[metric], metric) : "-"}</strong>
        </div>
        <div>
          <span>{metric === "weight" ? "Target" : "Target antrenor"}</span>
          <strong>
            {targetValue !== null && targetValue !== undefined
              ? formatNutritionValue(targetValue, metric)
              : "-"}
          </strong>
        </div>
      </div>

      <ProgressTrendChart points={chartPoints} metric={metric} />
    </section>
  );
}

function ClientNutritionPanel({ profile, target, logs, onLogSaved }) {
  const todayValue = toDateInputValue(new Date());
  const [selectedDate, setSelectedDate] = React.useState(todayValue);
  const [form, setForm] = React.useState({
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    weight: "",
    notes: "",
  });
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");
  const missingFields = getNutritionProfileMissingFields(profile);

  React.useEffect(() => {
    const existingLog = getNutritionLogForDate(logs, selectedDate);
    setForm({
      calories: existingLog?.calories ?? "",
      protein: existingLog?.protein ?? "",
      carbs: existingLog?.carbs ?? "",
      fats: existingLog?.fats ?? "",
      weight: existingLog?.weight ?? "",
      notes: existingLog?.notes ?? "",
    });
  }, [logs, selectedDate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setStatus("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setError("");

    try {
      const savedLog = await apiRequest("/api/client/nutrition-logs", {
        method: "POST",
        body: JSON.stringify({
          date: selectedDate,
          calories: Number(form.calories),
          protein: Number(form.protein),
          carbs: Number(form.carbs),
          fats: Number(form.fats),
          weight: form.weight === "" ? null : Number(form.weight),
          notes: form.notes,
        }),
      });

      onLogSaved(savedLog);
      setStatus("Logul nutritional a fost salvat.");
    } catch (exception) {
      setError(exception.message);
    }
  }

  return (
    <section className="workout-form nutrition-panel" id="nutritie" aria-label="Nutritie zilnica">
      <div className="section-heading">
        <span className="feature-index">Nutritie</span>
        <h2>Log zilnic kcal si macros</h2>
      </div>

      {missingFields.length ? (
        <div className="form-error">
          Completeaza {missingFields.join(", ")} in <a href="/datele-mele">Datele mele</a> pentru
          ca antrenorul sa poata calcula sugestia nutritionala.
        </div>
      ) : null}

      <WeightGoalSummary profile={profile} />

      <NutritionTargetSummary target={target} />

      <form className="nutrition-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Zi</span>
          <input
            type="date"
            max={todayValue}
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>kcal mancate</span>
          <input name="calories" type="number" min="0" value={form.calories} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Proteine (g)</span>
          <input name="protein" type="number" min="0" value={form.protein} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Carbohidrati (g)</span>
          <input name="carbs" type="number" min="0" value={form.carbs} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Grasimi (g)</span>
          <input name="fats" type="number" min="0" value={form.fats} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Greutate optionala (kg)</span>
          <input name="weight" type="number" min="30" max="250" step="0.1" value={form.weight} onChange={handleChange} />
        </label>
        <label className="field nutrition-notes">
          <span>Note</span>
          <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Ex: zi libera, masa in oras, foame ridicata" />
        </label>
        <button className="primary-button login-submit" type="submit">
          Salveaza nutritia
        </button>
        {status ? <p className="form-success">{status}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
      </form>

      <NutritionTrendPanel logs={logs} target={target} profile={profile} />
    </section>
  );
}

function TrainerNutritionPanel({ client, onUpdated }) {
  const [suggestion, setSuggestion] = React.useState(null);
  const [draft, setDraft] = React.useState({
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    notes: "",
  });
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoadingSuggestion, setIsLoadingSuggestion] = React.useState(false);
  const missingFields = getNutritionProfileMissingFields(client.clientProfile ?? {});

  React.useEffect(() => {
    setDraft({
      calories: client.nutritionTarget?.calories ?? "",
      protein: client.nutritionTarget?.protein ?? "",
      carbs: client.nutritionTarget?.carbs ?? "",
      fats: client.nutritionTarget?.fats ?? "",
      notes: client.nutritionTarget?.notes ?? "",
    });
    setSuggestion(null);
    setStatus("");
    setError("");
  }, [client.clientId, client.nutritionTarget]);

  function handleDraftChange(event) {
    const { name, value } = event.target;
    setDraft((currentDraft) => ({ ...currentDraft, [name]: value }));
    setStatus("");
    setError("");
  }

  async function handleGenerateSuggestion() {
    setIsLoadingSuggestion(true);
    setError("");
    setStatus("");

    try {
      const generatedSuggestion = await apiRequest(
        `/api/trainer/clients/${client.clientId}/nutrition-suggestion`
      );
      setSuggestion(generatedSuggestion);
      setDraft({
        calories: generatedSuggestion.calories,
        protein: generatedSuggestion.protein,
        carbs: generatedSuggestion.carbs,
        fats: generatedSuggestion.fats,
        notes: generatedSuggestion.formulaNotes,
      });
    } catch (exception) {
      setError(exception.message);
    } finally {
      setIsLoadingSuggestion(false);
    }
  }

  async function handleTargetSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("");

    try {
      await apiRequest(`/api/trainer/clients/${client.clientId}/nutrition-target`, {
        method: "PATCH",
        body: JSON.stringify({
          calories: Number(draft.calories),
          protein: Number(draft.protein),
          carbs: Number(draft.carbs),
          fats: Number(draft.fats),
          notes: draft.notes,
        }),
      });

      setStatus("Targetul nutritional a fost salvat pentru client.");
      await onUpdated();
    } catch (exception) {
      setError(exception.message);
    }
  }

  return (
    <section className="nutrition-panel">
      <div className="section-heading progress-history-header">
        <div>
          <span className="feature-index">Nutritie client</span>
          <h2>Target kcal si macros</h2>
        </div>
        <button
          className="text-button"
          type="button"
          onClick={handleGenerateSuggestion}
          disabled={isLoadingSuggestion || missingFields.length > 0}
        >
          {isLoadingSuggestion ? "Se calculeaza..." : "Calculeaza sugestia"}
        </button>
      </div>

      {missingFields.length ? (
        <p className="form-error">
          Clientul trebuie sa completeze {missingFields.join(", ")} in Datele mele pentru sugestia
          nutritionala.
        </p>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}

      <NutritionTargetSummary target={client.nutritionTarget} />
      <WeightGoalSummary profile={client.clientProfile ?? {}} suggestion={suggestion} />

      {suggestion ? (
        <div className="nutrition-suggestion-grid">
          <div>
            <span>BMI</span>
            <strong>{suggestion.bmi}</strong>
          </div>
          <div>
            <span>BMR</span>
            <strong>{formatNutritionValue(suggestion.bmr, "calories")}</strong>
          </div>
          <div>
            <span>TDEE</span>
            <strong>{formatNutritionValue(suggestion.tdee, "calories")}</strong>
          </div>
          <div>
            <span>Obiectiv</span>
            <strong>{suggestion.objective}</strong>
          </div>
          {suggestion.targetWeight !== null && suggestion.targetWeight !== undefined ? (
            <>
              <div>
                <span>Greutate tinta</span>
                <strong>{formatNutritionValue(suggestion.targetWeight, "weight")}</strong>
              </div>
              <div>
                <span>Diferenta</span>
                <strong>{formatSignedWeight(suggestion.weightDelta)}</strong>
              </div>
            </>
          ) : null}
          <p>
            Interval kcal: {suggestion.caloriesMin}-{suggestion.caloriesMax}. Proteine:{" "}
            {suggestion.proteinMin}-{suggestion.proteinMax}g. Grasimi: {suggestion.fatsMin}-
            {suggestion.fatsMax}g.
          </p>
        </div>
      ) : null}

      <form className="nutrition-form" onSubmit={handleTargetSubmit}>
        <label className="field">
          <span>kcal target</span>
          <input name="calories" type="number" min="1" value={draft.calories} onChange={handleDraftChange} required />
        </label>
        <label className="field">
          <span>Proteine (g)</span>
          <input name="protein" type="number" min="1" value={draft.protein} onChange={handleDraftChange} required />
        </label>
        <label className="field">
          <span>Carbohidrati (g)</span>
          <input name="carbs" type="number" min="0" value={draft.carbs} onChange={handleDraftChange} required />
        </label>
        <label className="field">
          <span>Grasimi (g)</span>
          <input name="fats" type="number" min="1" value={draft.fats} onChange={handleDraftChange} required />
        </label>
        <label className="field nutrition-notes">
          <span>Note pentru client</span>
          <textarea name="notes" value={draft.notes} onChange={handleDraftChange} placeholder="Ex: mentine targetul 14 zile, ajusteaza dupa media greutatii" />
        </label>
        <button className="primary-button login-submit" type="submit">
          Salveaza targetul
        </button>
        {status ? <p className="form-success">{status}</p> : null}
      </form>

      <NutritionTrendPanel
        logs={client.nutritionLogs ?? []}
        target={client.nutritionTarget}
        profile={client.clientProfile ?? {}}
      />
    </section>
  );
}

function DashboardPage() {
  const session = getStoredAuth();
  const user = session?.user;
  const [profile, setProfile] = React.useState({});
  const [selectedPlan, setSelectedPlan] = React.useState(null);
  const [assignedExercises, setAssignedExercises] = React.useState([]);
  const [chatMessages, setChatMessages] = React.useState([]);
  const [appointments, setAppointments] = React.useState([]);
  const [availableSlots, setAvailableSlots] = React.useState([]);
  const [nutritionTarget, setNutritionTarget] = React.useState(null);
  const [nutritionLogs, setNutritionLogs] = React.useState([]);
  const [selectedTrainingDate, setSelectedTrainingDate] = React.useState(new Date());
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState("");
  const [profileSaved, setProfileSaved] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setStatus("loading");
      setError("");

      try {
        const [
          plan,
          profileData,
          assigned,
          scheduledAppointments,
          target,
          nutritionLogData,
        ] = await Promise.all([
          apiRequest("/api/client/plan"),
          apiRequest("/api/client/profile"),
          apiRequest("/api/client/assigned-exercises"),
          apiRequest("/api/client/appointments"),
          apiRequest("/api/client/nutrition-target"),
          apiRequest("/api/client/nutrition-logs"),
        ]);
        const [messages, slots] = plan
          ? await Promise.all([apiRequest("/api/client/chat"), apiRequest("/api/client/availability")])
          : [[], []];

        if (!isMounted) {
          return;
        }

        setSelectedPlan(plan);
        setAssignedExercises(assigned ?? []);
        setAppointments(scheduledAppointments ?? []);
        setAvailableSlots(slots ?? []);
        setProfile(profileData ?? {});
        setChatMessages(messages ?? []);
        setNutritionTarget(target);
        setNutritionLogs(sortNutritionLogs(nutritionLogData ?? []));
        setStatus("ready");
      } catch (exception) {
        if (!isMounted) {
          return;
        }

        setError(exception.message);
        setStatus("ready");
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleLogout() {
    clearAuthSession();
    window.location.href = "/login";
  }

  function handleProfileChange(event) {
    const { name, value } = event.target;

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));
    setProfileSaved(false);
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    const savedProfile = await apiRequest("/api/client/profile", {
      method: "PATCH",
      body: JSON.stringify({
        age: profile.age ? Number(profile.age) : null,
        height: profile.height ? Number(profile.height) : null,
        weight: profile.weight ? Number(profile.weight) : null,
        targetWeight: profile.targetWeight ? Number(profile.targetWeight) : null,
        targetDate: profile.targetDate || null,
        sex: profile.sex ?? null,
        lifestyle: profile.lifestyle ?? null,
        experienceLevel: profile.experienceLevel ?? null,
        goal: profile.goal ?? null,
        daysPerWeek: profile.daysPerWeek ? Number(profile.daysPerWeek) : null,
        maxSessionDuration: profile.maxSessionDuration ? Number(profile.maxSessionDuration) : null,
        restrictions: profile.restrictions ?? null,
      }),
    });
    setProfile(savedProfile ?? {});
    setProfileSaved(true);
  }

  async function handleClientMessage(text) {
    const message = await apiRequest("/api/client/chat", {
      method: "POST",
      body: JSON.stringify({ text }),
    });

    setChatMessages((currentMessages) => [...currentMessages, message]);
  }

  async function handleAssignedExerciseResults(assignmentId, repsPerSet, weightsPerSet) {
    const updatedAssignment = await apiRequest(
      `/api/client/assigned-exercises/${assignmentId}/results`,
      {
        method: "PATCH",
        body: JSON.stringify({ repsPerSet, weightsPerSet }),
      }
    );

    setAssignedExercises((currentAssignments) =>
      currentAssignments.map((assignment) =>
        assignment.id === assignmentId ? updatedAssignment : assignment
      )
    );
  }

  async function handleBookSlot(slotId) {
    await apiRequest(`/api/client/availability/${slotId}/book`, {
      method: "POST",
    });

    const [scheduledAppointments, slots] = await Promise.all([
      apiRequest("/api/client/appointments"),
      apiRequest("/api/client/availability"),
    ]);
    setAppointments(scheduledAppointments ?? []);
    setAvailableSlots(slots ?? []);
  }

  function handleNutritionLogSaved(savedLog) {
    setNutritionLogs((currentLogs) =>
      sortNutritionLogs([
        ...currentLogs.filter((log) => log.date !== savedLog.date),
        savedLog,
      ])
    );
  }

  const notifications = getClientNotifications(
    selectedPlan,
    chatMessages,
    assignedExercises,
    appointments
  );
  const selectedDayExercises = getExercisesForDate(assignedExercises, selectedTrainingDate);

  return (
    <main className="dashboard-shell">
      <nav className="topbar auth-topbar" aria-label="Navigatie dashboard">
        <a className="brand" href={getHomeHref(user)}>
          <TetFitLogo />
          <span>TET-FIT</span>
        </a>
        <div className="nav-links">
          <a className="nav-action" href="/exercitii">
            Exercitii
          </a>
          <a className="nav-action" href="/antrenori">
            Antrenori
          </a>
          <NotificationsMenu notifications={notifications} />
          <button className="nav-action nav-action-strong" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>

      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Dashboard personal</p>
          <h1>{user ? `Salut, ${user.fullName}` : "Progresul tau"}</h1>
          <p className="dashboard-copy">
            Urmareste exercitiile primite de la antrenor, completeaza seriile si rezerva
            orele disponibile din calendar.
          </p>
        </div>
      </section>

      <section className="dashboard-grid" aria-label="Dashboard progres">
        {error ? <p className="form-error">{error}</p> : null}
        {status === "loading" ? <p className="exercise-state">Se incarca dashboard-ul...</p> : null}
        <article className="progress-monitor">
          {!selectedPlan ? (
            <div className="selected-plan">
              <p>Nu ai ales inca un plan de antrenament.</p>
              <a className="primary-button" href="/antrenori">
                Alege plan
              </a>
            </div>
          ) : null}

          <section className="workout-form" id="antrenamente" aria-label="Exercitii atribuite">
            <DayPager
              selectedDate={selectedTrainingDate}
              onSelectedDateChange={setSelectedTrainingDate}
              exercises={selectedDayExercises}
            />
            <div className="section-heading">
              <span className="feature-index">Exercitii antrenor</span>
              <h2>Completeaza repetarile pe serii</h2>
            </div>
            <AssignedExercisesPanel
              exercises={selectedDayExercises}
              onSubmitResults={handleAssignedExerciseResults}
            />
          </section>

          <section className="workout-form" id="calendar" aria-label="Calendar antrenamente">
            <div className="section-heading">
              <span className="feature-index">Calendar</span>
              <h2>Programeaza-te la antrenor</h2>
            </div>
            <ClientBookingPanel
              availableSlots={availableSlots}
              appointments={appointments}
              onBookSlot={handleBookSlot}
            />
          </section>

          <ClientNutritionPanel
            profile={profile}
            target={nutritionTarget}
            logs={nutritionLogs}
            onLogSaved={handleNutritionLogSaved}
          />
        </article>

        <aside className="dashboard-side">
          <article>
            <span className="feature-index">Cont client</span>
            <h2>Actiuni rapide</h2>
            <div className="quick-actions">
              <a className="primary-button" href="/datele-mele">
                Datele mele
              </a>
              <a className="text-button" href="/plan-activ">
                Plan activ
              </a>
              <a className="text-button" href="#nutritie">
                Nutritie
              </a>
            </div>
          </article>
          <article id="chat">
            <span className="feature-index">Chat antrenor</span>
            <h2>Discutie plan</h2>
            {selectedPlan ? (
              <ChatPanel
                currentUser={user}
                messages={chatMessages}
                onSendMessage={handleClientMessage}
              />
            ) : (
              <p>Alege un plan pentru a discuta cu antrenorul.</p>
            )}
          </article>
          <article>
            <span className="feature-index">Recomandare</span>
            <h2>{selectedPlan?.focus ?? "Plan personalizat"}</h2>
            <p>
              Antrenorul poate adapta tipurile de antrenamente dupa planul ales
              si dupa progresul incarcat de tine.
            </p>
          </article>
        </aside>
      </section>
    </main>
  );
}

function ClientProfilePage() {
  const session = getStoredAuth();
  const user = session?.user;
  const [profile, setProfile] = React.useState({});
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const profileData = await apiRequest("/api/client/profile");
        if (isMounted) {
          setProfile(profileData ?? {});
          setStatus("ready");
        }
      } catch (exception) {
        if (isMounted) {
          setError(exception.message);
          setStatus("ready");
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setProfile((currentProfile) => ({ ...currentProfile, [name]: value }));
    setSaved(false);
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();

    const savedProfile = await apiRequest("/api/client/profile", {
      method: "PATCH",
      body: JSON.stringify({
        age: profile.age ? Number(profile.age) : null,
        height: profile.height ? Number(profile.height) : null,
        weight: profile.weight ? Number(profile.weight) : null,
        targetWeight: profile.targetWeight ? Number(profile.targetWeight) : null,
        targetDate: profile.targetDate || null,
        sex: profile.sex ?? null,
        lifestyle: profile.lifestyle ?? null,
        experienceLevel: profile.experienceLevel ?? null,
        goal: profile.goal ?? null,
        daysPerWeek: profile.daysPerWeek ? Number(profile.daysPerWeek) : null,
        maxSessionDuration: profile.maxSessionDuration ? Number(profile.maxSessionDuration) : null,
        restrictions: profile.restrictions ?? null,
      }),
    });

    setProfile(savedProfile ?? {});
    setSaved(true);
  }

  return (
    <main className="dashboard-shell">
      <nav className="topbar auth-topbar" aria-label="Navigatie profil client">
        <a className="brand" href={getHomeHref(user)}>
          <TetFitLogo />
          <span>TET-FIT</span>
        </a>
        <div className="nav-links">
          <ClientNotificationsButton />
          <a className="nav-action" href="/dashboard">
            Dashboard
          </a>
          <a className="nav-action" href="/plan-activ">
            Plan activ
          </a>
        </div>
      </nav>

      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Profil client</p>
          <h1>Datele mele</h1>
          <p className="dashboard-copy">
            Completeaza datele de care antrenorul are nevoie pentru adaptarea planului.
          </p>
        </div>
      </section>

      <section className="progress-monitor">
        {status === "loading" ? <p className="exercise-state">Se incarca datele...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        <form className="profile-form" onSubmit={handleProfileSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>Varsta</span>
              <input type="number" name="age" min="12" max="100" value={profile.age ?? ""} onChange={handleProfileChange} required />
            </label>
            <label className="field">
              <span>Inaltime</span>
              <input type="number" name="height" min="100" max="230" value={profile.height ?? ""} onChange={handleProfileChange} placeholder="cm" required />
            </label>
            <label className="field">
              <span>Greutate</span>
              <input type="number" name="weight" min="30" max="250" step="0.1" value={profile.weight ?? ""} onChange={handleProfileChange} placeholder="kg" required />
            </label>
            <label className="field">
              <span>Sex</span>
              <select name="sex" value={profile.sex ?? ""} onChange={handleProfileChange} required>
                <option value="" disabled>Alege sexul</option>
                <option value="feminin">Feminin</option>
                <option value="masculin">Masculin</option>
              </select>
            </label>
            <label className="field">
              <span>Stil de viata</span>
              <select name="lifestyle" value={profile.lifestyle ?? ""} onChange={handleProfileChange} required>
                <option value="" disabled>Alege stilul de viata</option>
                <option value="sedentar">Sedentar</option>
                <option value="usor">Usor activ</option>
                <option value="moderat">Moderat</option>
                <option value="intens">Intens</option>
              </select>
            </label>
            <label className="field">
              <span>Nivel experienta</span>
              <select name="experienceLevel" value={profile.experienceLevel ?? ""} onChange={handleProfileChange}>
                <option value="">Alege nivelul</option>
                <option value="incepator">Incepator</option>
                <option value="intermediar">Intermediar</option>
                <option value="avansat">Avansat</option>
              </select>
            </label>
            <label className="field">
              <span>Obiectiv</span>
              <select name="goal" value={profile.goal ?? ""} onChange={handleProfileChange} required>
                <option value="" disabled>Alege obiectivul</option>
                <option value="mentinere">Mentinere</option>
                <option value="masa musculara">Masa musculara</option>
                <option value="slabire">Slabire</option>
                <option value="forta">Forta</option>
                <option value="rezistenta">Rezistenta</option>
                <option value="recuperare">Recuperare</option>
              </select>
            </label>
            <label className="field">
              <span>Greutate tinta optionala</span>
              <input
                type="number"
                name="targetWeight"
                min="30"
                max="250"
                step="0.1"
                value={profile.targetWeight ?? ""}
                onChange={handleProfileChange}
                placeholder="kg"
              />
            </label>
            <label className="field">
              <span>Termen tinta optional</span>
              <input
                type="date"
                name="targetDate"
                min={toDateInputValue(new Date())}
                value={profile.targetDate ?? ""}
                onChange={handleProfileChange}
              />
            </label>
            <label className="field">
              <span>Zile disponibile / saptamana</span>
              <input type="number" name="daysPerWeek" min="1" max="7" value={profile.daysPerWeek ?? ""} onChange={handleProfileChange} />
            </label>
            <label className="field">
              <span>Durata maxima sedinta</span>
              <input type="number" name="maxSessionDuration" min="15" max="180" value={profile.maxSessionDuration ?? ""} onChange={handleProfileChange} placeholder="minute" />
            </label>
          </div>
          <label className="field">
            <span>Accidentari / restrictii</span>
            <textarea name="restrictions" value={profile.restrictions ?? ""} onChange={handleProfileChange} placeholder="Ex: dureri lombare, evita alergare, umar sensibil" />
          </label>
          <button className="primary-button login-submit" type="submit">
            Salveaza datele
          </button>
          {saved ? <p className="form-success">Datele au fost salvate.</p> : null}
        </form>
      </section>
    </main>
  );
}

function ActivePlanPage() {
  const session = getStoredAuth();
  const user = session?.user;
  const [plan, setPlan] = React.useState(null);
  const [assignedExercises, setAssignedExercises] = React.useState([]);
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isRenewing, setIsRenewing] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    async function loadPlan() {
      try {
        const [planData, assigned] = await Promise.all([
          apiRequest("/api/client/plan"),
          apiRequest("/api/client/assigned-exercises"),
        ]);
        if (isMounted) {
          setPlan(planData);
          setAssignedExercises(assigned ?? []);
          setStatus("ready");
        }
      } catch (exception) {
        if (isMounted) {
          setError(exception.message);
          setStatus("ready");
        }
      }
    }

    loadPlan();

    return () => {
      isMounted = false;
    };
  }, []);

  const exerciseGroups = Object.values(groupAssignedExercisesByDay(assignedExercises));
  const planExpired = isPlanExpired(plan);

  async function handleRenewPlan() {
    setError("");
    setSuccess("");
    setIsRenewing(true);

    try {
      const renewedPlan = await apiRequest("/api/client/plan/renew", {
        method: "POST",
      });
      setPlan(renewedPlan);
      setSuccess(`Abonamentul a fost reinnoit pana la ${getPlanMinimumEndDate(renewedPlan)}.`);
    } catch (exception) {
      setError(exception.message);
    } finally {
      setIsRenewing(false);
    }
  }

  return (
    <main className="dashboard-shell">
      <nav className="topbar auth-topbar" aria-label="Navigatie plan activ">
        <a className="brand" href={getHomeHref(user)}>
          <TetFitLogo />
          <span>TET-FIT</span>
        </a>
        <div className="nav-links">
          <ClientNotificationsButton />
          <a className="nav-action" href="/dashboard">Dashboard</a>
          <a className="nav-action" href="/datele-mele">Datele mele</a>
        </div>
      </nav>

      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Plan activ</p>
          <h1>{plan ? `${plan.sessions} sedinte pe saptamana` : "Nu exista plan activ"}</h1>
          {plan ? (
            <p className="dashboard-copy">
              Antrenor: {plan.trainerName}.{" "}
              {planExpired
                ? `Abonamentul a expirat la ${getPlanMinimumEndDate(plan)}.`
                : `Plan valabil pana la ${getPlanMinimumEndDate(plan)}.`}
            </p>
          ) : (
            <p className="dashboard-copy">Alege un plan pentru a primi antrenamente structurate.</p>
          )}
        </div>
      </section>

      <section className="trainer-workspace">
        {status === "loading" ? <p className="exercise-state">Se incarca planul...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="form-success">{success}</p> : null}
        {plan ? (
          <article className="progress-monitor">
            <span className="feature-index">{plan.focus}</span>
            <h2>Detalii abonament</h2>
            <div className="selected-plan">
              <p>Pret: <strong>{plan.price} RON / luna</strong></p>
              <p>
                Status:{" "}
                <strong>{planExpired ? "Expirat" : "Activ"}</strong>
              </p>
              <p>
                {planExpired ? "A expirat la" : "Expira la"}:{" "}
                <strong>{getPlanMinimumEndDate(plan)}</strong>
              </p>
              {plan.trainerNotes ? <p>Ajustari: <strong>{plan.trainerNotes}</strong></p> : null}
              {planExpired ? (
                <div className="plan-renewal-actions">
                  <p>
                    Reinnoirea pastreaza acelasi antrenor si acelasi pachet lunar.
                  </p>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={handleRenewPlan}
                    disabled={isRenewing}
                  >
                    {isRenewing ? "Se reinnoieste..." : "Reinnoieste abonamentul"}
                  </button>
                </div>
              ) : null}
            </div>
          </article>
        ) : null}
        {exerciseGroups.map((group) => (
          <article className="progress-monitor" key={group.dayName}>
            <span className="feature-index">{[...group.muscleGroups].join(", ") || "Grupe stabilite de antrenor"}</span>
            <h2>{group.dayName}</h2>
            <div className="assigned-exercise-list compact-list">
              {group.exercises.map((exercise) => (
                <div className="assigned-exercise-card" key={exercise.id}>
                  <ExerciseMedia
                    exerciseId={exercise.exerciseId}
                    gifUrl={exercise.gifUrl}
                    name={exercise.exerciseName}
                  />
                  <div>
                    <h3>{exercise.exerciseName}</h3>
                    <p>{exercise.setsCount} serii x {exercise.minReps}-{exercise.maxReps} repetari</p>
                    {exercise.notes ? <small>{exercise.notes}</small> : null}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function TrainerClientPage() {
  const session = getStoredAuth();
  const user = session?.user;
  const trainerClientParams = new URLSearchParams(window.location.search);
  const clientId = trainerClientParams.get("clientId");
  const selectedDateParam = trainerClientParams.get("date");
  const [trainerClients, setTrainerClients] = React.useState([]);
  const [exerciseOptions, setExerciseOptions] = React.useState([]);
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState("");
  const [isPlanEditorOpen, setIsPlanEditorOpen] = React.useState(false);
  const [selectedTrainingDate] = React.useState(() => getDateFromInputValue(selectedDateParam));

  React.useEffect(() => {
    refreshTrainerClients();
    loadExerciseOptions();
  }, []);

  const client = trainerClients.find((item) => item.clientId === clientId);
  const selectedDayExercises = client
    ? getExercisesForDate(client.assignedExercises ?? [], selectedTrainingDate)
    : [];

  async function refreshTrainerClients() {
    setStatus("loading");
    setError("");

    try {
      const clients = await apiRequest("/api/trainer/clients");
      setTrainerClients(clients ?? []);
      setStatus("ready");
    } catch (exception) {
      setError(exception.message);
      setStatus("ready");
    }
  }

  async function loadExerciseOptions() {
    try {
      const exercises = await apiRequest("/api/exercises");
      setExerciseOptions(exercises ?? []);
    } catch {
      setExerciseOptions([]);
    }
  }

  async function handleTrainingUpdate(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const focus = formData.get("focus")?.toString().trim();
    const trainerNotes = formData.get("trainerNotes")?.toString().trim();

    await apiRequest(`/api/trainer/clients/${client.clientId}/plan`, {
      method: "PATCH",
      body: JSON.stringify({ focus, trainerNotes }),
    });
    await refreshTrainerClients();
  }

  async function handleTrainerMessage(text) {
    await apiRequest(`/api/trainer/clients/${client.clientId}/chat`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    await refreshTrainerClients();
  }

  return (
    <main className="dashboard-shell">
      <nav className="topbar auth-topbar" aria-label="Navigatie client antrenor">
        <a className="brand" href={getHomeHref(user)}>
          <TetFitLogo />
          <span>TET-FIT</span>
        </a>
        <div className="nav-links">
          <a className="nav-action" href="/antrenor-dashboard">
            Dashboard
          </a>
          <a className="nav-action" href="/exercitii">
            Exercitii
          </a>
        </div>
      </nav>

      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Client antrenor</p>
          <h1>{client?.clientName ?? "Client"}</h1>
          <p className="dashboard-copy">
            Gestioneaza planul, ziua de antrenament, exercitiile si comunicarea cu clientul.
          </p>
        </div>
      </section>

      <section className="trainer-workspace">
        {error ? <p className="form-error">{error}</p> : null}
        {status === "loading" ? <p className="exercise-state">Se incarca clientul...</p> : null}
        {!client && status !== "loading" ? (
          <article className="client-card">
            <span className="feature-index">Client indisponibil</span>
            <h2>Nu am gasit clientul selectat</h2>
            <p>Intoarce-te in dashboard si alege un client din lista actualizata.</p>
          </article>
        ) : null}
        {client ? (
          <article className="client-card client-detail-card">
            <div>
              <span className="feature-index">{client.sessions} sedinte / saptamana</span>
              <h2>{client.clientName}</h2>
              <p>{client.clientEmail}</p>
              <p>Plan activ pana la {getPlanMinimumEndDate(client)}</p>
            </div>
            <div className="training-types">
              <strong>Plan si focus</strong>
              <span>{client.focus}</span>
              {client.trainerNotes ? <span>{client.trainerNotes}</span> : null}
              <button
                className="text-button"
                type="button"
                onClick={() => setIsPlanEditorOpen((currentValue) => !currentValue)}
              >
                {isPlanEditorOpen ? "Inchide editarea" : "Editeaza planul"}
              </button>
              {isPlanEditorOpen ? (
              <form className="trainer-update-form plan-editor-form" onSubmit={handleTrainingUpdate}>
                <label className="field">
                  <span>Focus actualizat</span>
                  <input name="focus" defaultValue={client.focus} required />
                </label>
                <label className="field">
                  <span>Modificari antrenament</span>
                  <textarea
                    name="trainerNotes"
                    defaultValue={client.trainerNotes ?? ""}
                    placeholder="Ex: reducem volumul la picioare, adaugam cardio 2 zile"
                  />
                </label>
                <button className="primary-button login-submit" type="submit">
                  Actualizeaza planul
                </button>
              </form>
              ) : null}
            </div>
            <div className="log-list">
              <ClientWorkoutSummary client={client} selectedDate={selectedTrainingDate} />
            </div>
            <div className="client-chat">
              <ClientProgressPanel client={client} />
            </div>
            <div className="client-chat">
              <TrainerNutritionPanel client={client} onUpdated={refreshTrainerClients} />
            </div>
            <div className="client-chat">
              <span className="feature-index">Exercitii atribuite</span>
              <div className="selected-day-note">
                <strong>
                  {selectedTrainingDate.toLocaleDateString("ro-RO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
                <span>{getDayMuscleGroups(selectedDayExercises)}</span>
                <a
                  className="text-button"
                  href={`/antrenor-dashboard?date=${toDateInputValue(selectedTrainingDate)}`}
                >
                  Schimba ziua in dashboard
                </a>
              </div>
              {selectedDayExercises.length ? (
                <div className="assigned-exercise-list compact-list">
                  {selectedDayExercises.map((assignment) => (
                    <TrainerAssignedExerciseCard
                      assignment={assignment}
                      key={assignment.id}
                      onUpdated={refreshTrainerClients}
                    />
                  ))}
                </div>
              ) : (
                <p>Nu ai atribuit exercitii acestui client.</p>
              )}
              <AssignExerciseForm
                clientId={client.clientId}
                exerciseOptions={exerciseOptions}
                scheduledDate={selectedTrainingDate}
                existingExercises={selectedDayExercises}
                onAssigned={refreshTrainerClients}
              />
            </div>
            <div className="client-chat">
              <span className="feature-index">Chat client</span>
              <ChatPanel
                currentUser={user}
                messages={client.messages}
                onSendMessage={handleTrainerMessage}
              />
            </div>
          </article>
        ) : null}
      </section>
    </main>
  );
}

function TrainerClientHistoryPage() {
  const session = getStoredAuth();
  const user = session?.user;
  const trainerClientParams = new URLSearchParams(window.location.search);
  const clientId = trainerClientParams.get("clientId");
  const [trainerClients, setTrainerClients] = React.useState([]);
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let isMounted = true;

    async function loadClient() {
      setStatus("loading");
      setError("");

      try {
        const clients = await apiRequest("/api/trainer/clients");

        if (isMounted) {
          setTrainerClients(clients ?? []);
          setStatus("ready");
        }
      } catch (exception) {
        if (isMounted) {
          setError(exception.message);
          setStatus("ready");
        }
      }
    }

    loadClient();

    return () => {
      isMounted = false;
    };
  }, []);

  const client = trainerClients.find((item) => item.clientId === clientId);
  const workoutResults = client ? getCompletedExerciseResults(client.assignedExercises ?? []) : [];
  const workoutDays = getWorkoutProgressByDay(workoutResults);
  const sortedNutritionLogs = sortNutritionLogs(client?.nutritionLogs ?? []);
  const latestWorkout = workoutDays[workoutDays.length - 1];
  const latestNutritionLog = sortedNutritionLogs[sortedNutritionLogs.length - 1];

  return (
    <main className="dashboard-shell">
      <nav className="topbar auth-topbar" aria-label="Navigatie istoric client">
        <a className="brand" href={getHomeHref(user)}>
          <TetFitLogo />
          <span>TET-FIT</span>
        </a>
        <div className="nav-links">
          <a className="nav-action" href="/antrenor-dashboard">
            Dashboard
          </a>
          <a className="nav-action" href={`/antrenor-client?clientId=${clientId}`}>
            Inapoi la client
          </a>
        </div>
      </nav>

      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Istoric client</p>
          <h1>{client?.clientName ?? "Istoric"}</h1>
          <p className="dashboard-copy">
            Antrenamente efectuate, volum, exercitii si loguri nutritionale intr-o pagina separata.
          </p>
        </div>
      </section>

      <section className="trainer-workspace history-workspace">
        {error ? <p className="form-error">{error}</p> : null}
        {status === "loading" ? <p className="exercise-state">Se incarca istoricul...</p> : null}
        {!client && status !== "loading" ? (
          <article className="progress-monitor">
            <span className="feature-index">Client indisponibil</span>
            <h2>Nu am gasit clientul selectat</h2>
            <p>Intoarce-te in dashboard si alege clientul din lista actualizata.</p>
          </article>
        ) : null}
        {client ? (
          <>
            <article className="progress-monitor">
              <div className="section-heading progress-history-header">
                <div>
                  <span className="feature-index">Antrenamente</span>
                  <h2>Istoric antrenamente</h2>
                </div>
                <a className="text-button" href={`/antrenor-client?clientId=${client.clientId}`}>
                  Inapoi la progres
                </a>
              </div>
              <div className="progress-history-stats">
                <div>
                  <span>Zile completate</span>
                  <strong>{workoutDays.length}</strong>
                </div>
                <div>
                  <span>Exercitii completate</span>
                  <strong>{workoutResults.length}</strong>
                </div>
                <div>
                  <span>Ultimul antrenament</span>
                  <strong>
                    {latestWorkout ? latestWorkout.date.toLocaleDateString("ro-RO") : "-"}
                  </strong>
                </div>
              </div>
              <ClientWorkoutHistoryList client={client} />
            </article>

            <article className="progress-monitor">
              <div className="section-heading progress-history-header">
                <div>
                  <span className="feature-index">Nutritie</span>
                  <h2>Istoric calorii si macros</h2>
                </div>
              </div>
              <div className="progress-history-stats nutrition-stats">
                <div>
                  <span>Zile logate</span>
                  <strong>{sortedNutritionLogs.length}</strong>
                </div>
                <div>
                  <span>Ultimele calorii</span>
                  <strong>
                    {latestNutritionLog
                      ? formatNutritionValue(latestNutritionLog.calories, "calories")
                      : "-"}
                  </strong>
                </div>
                <div>
                  <span>Ultima greutate</span>
                  <strong>
                    {latestNutritionLog?.weight
                      ? formatNutritionValue(latestNutritionLog.weight, "weight")
                      : "-"}
                  </strong>
                </div>
              </div>
              <ClientNutritionHistoryList logs={client.nutritionLogs ?? []} />
            </article>
          </>
        ) : null}
      </section>
    </main>
  );
}

function TrainerDashboardPage() {
  const session = getStoredAuth();
  const user = session?.user;
  const trainerDashboardParams = new URLSearchParams(window.location.search);
  const [trainerClients, setTrainerClients] = React.useState([]);
  const [availabilitySlots, setAvailabilitySlots] = React.useState([]);
  const [selectedTrainingDate, setSelectedTrainingDate] = React.useState(() =>
    getDateFromInputValue(trainerDashboardParams.get("date"))
  );
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    refreshTrainerClients();
    refreshAvailabilitySlots();
  }, []);

  function handleLogout() {
    clearAuthSession();
    window.location.href = "/login";
  }

  async function refreshTrainerClients() {
    setStatus("loading");
    setError("");

    try {
      const clients = await apiRequest("/api/trainer/clients");
      setTrainerClients(clients ?? []);
      setStatus("ready");
    } catch (exception) {
      setError(exception.message);
      setStatus("ready");
    }
  }

  async function refreshAvailabilitySlots() {
    try {
      const slots = await apiRequest("/api/trainer/availability");
      setAvailabilitySlots(slots ?? []);
    } catch {
      setAvailabilitySlots([]);
    }
  }

  async function handleCreateAvailabilitySlot(slot) {
    const createdSlots = await apiRequest("/api/trainer/availability", {
      method: "POST",
      body: JSON.stringify(slot),
    });
    await refreshAvailabilitySlots();
    await refreshTrainerClients();
    return createdSlots;
  }

  const selectedDateExercises = trainerClients.flatMap((client) =>
    getExercisesForDate(client.assignedExercises ?? [], selectedTrainingDate)
  );

  return (
    <main className="dashboard-shell">
      <nav className="topbar auth-topbar" aria-label="Navigatie dashboard antrenor">
        <a className="brand" href={getHomeHref(user)}>
          <TetFitLogo />
          <span>TET-FIT</span>
        </a>
        <div className="nav-links">
          <a className="nav-action" href="/exercitii">
            Exercitii
          </a>
          <a className="nav-action" href="/antrenori">
            Planuri
          </a>
          <a className="nav-action" href="#calendar">
            Calendar
          </a>
          <button className="nav-action nav-action-strong" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>

      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Dashboard antrenor</p>
          <h1>{user ? `Salut, ${user.fullName}` : "Clienti si planuri"}</h1>
          <p className="dashboard-copy">
            Vezi clientii care au ales un plan, tipurile de antrenamente
            recomandate si progresul incarcat de fiecare client.
          </p>
        </div>
      </section>

      <section className="trainer-workspace" aria-label="Clienti antrenor">
        <article className="progress-monitor" id="calendar">
          <TrainerAvailabilityPanel
            slots={availabilitySlots}
            onCreateSlot={handleCreateAvailabilitySlot}
          />
        </article>
        {error ? <p className="form-error">{error}</p> : null}
        {status === "loading" ? <p className="exercise-state">Se incarca clientii...</p> : null}
        {trainerClients.length ? (
          <article className="progress-monitor">
            <span className="feature-index">Clienti activi</span>
            <h2>Alege clientul</h2>
            <DayPager
              selectedDate={selectedTrainingDate}
              onSelectedDateChange={setSelectedTrainingDate}
              exercises={selectedDateExercises}
              subtitle={`${selectedDateExercises.length} exercitii planificate pentru clientii din aceasta zi`}
            />
            <div className="client-button-grid">
              {trainerClients.map((client) => {
                const dayExercises = getExercisesForDate(
                  client.assignedExercises ?? [],
                  selectedTrainingDate
                );
                const summary = getClientCompletionSummary(client, selectedTrainingDate);

                return (
                  <a
                    className={`client-access-button ${
                      summary.isComplete ? "client-access-complete" : ""
                    }`}
                    href={`/antrenor-client?clientId=${client.clientId}&date=${toDateInputValue(
                      selectedTrainingDate
                    )}`}
                    key={client.clientId}
                  >
                    <strong>{client.clientName}</strong>
                    <span>{client.sessions} sedinte / saptamana</span>
                    <small>
                      {summary.total
                        ? `${summary.completed}/${summary.total} exercitii completate`
                        : "Nu are exercitii atribuite"}
                    </small>
                    <div className="client-exercise-statuses">
                      {dayExercises.slice(0, 5).map((exercise) => (
                        <span
                          className={isExerciseCompleted(exercise) ? "status-done" : "status-missing"}
                          key={exercise.id}
                        >
                          {isExerciseCompleted(exercise) ? "OK" : "x"} {exercise.exerciseName}
                        </span>
                      ))}
                    </div>
                  </a>
                );
              })}
            </div>
          </article>
        ) : (
          <article className="client-card">
            <span className="feature-index">Fara clienti</span>
            <h2>Nu exista planuri alese pentru acest antrenor</h2>
            <p>Clientii vor aparea aici dupa ce isi aleg un plan din pagina Antrenori.</p>
          </article>
        )}
      </section>
    </main>
  );
}

function getAdminActionLabel(action) {
  const labels = {
    CREATE_TRAINER: "Creare antrenor",
    ACTIVATE_ACCOUNT: "Activare cont",
    DEACTIVATE_ACCOUNT: "Dezactivare cont",
    DELETE_ACCOUNT: "Stergere definitiva",
  };

  return labels[action] ?? action;
}

function SuperAdminDashboardPage() {
  const session = getStoredAuth();
  const user = session?.user;
  const [summary, setSummary] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [payments, setPayments] = React.useState(null);
  const [chats, setChats] = React.useState([]);
  const [selectedChatId, setSelectedChatId] = React.useState("");
  const [auditLogs, setAuditLogs] = React.useState([]);
  const [untilDate, setUntilDate] = React.useState(toDateInputValue(new Date()));
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isCreatingTrainer, setIsCreatingTrainer] = React.useState(false);
  const [pendingAdminAction, setPendingAdminAction] = React.useState(null);
  const [confirmationInput, setConfirmationInput] = React.useState("");
  const [isAdminActionSubmitting, setIsAdminActionSubmitting] = React.useState(false);

  React.useEffect(() => {
    loadAdminDashboard();
  }, []);

  async function loadAdminDashboard(nextUntilDate = untilDate) {
    setStatus("loading");
    setError("");

    try {
      const [summaryData, userData, paymentData, chatData, auditData] = await Promise.all([
        apiRequest("/api/admin/summary"),
        apiRequest("/api/admin/users"),
        apiRequest(`/api/admin/payments?until=${nextUntilDate}`),
        apiRequest("/api/admin/chats"),
        apiRequest("/api/admin/audit-logs"),
      ]);

      setSummary(summaryData);
      setUsers(userData ?? []);
      setPayments(paymentData);
      setChats(chatData ?? []);
      setSelectedChatId((currentChatId) => {
        if ((chatData ?? []).some((conversation) => conversation.id === currentChatId)) {
          return currentChatId;
        }
        return chatData?.[0]?.id ?? "";
      });
      setAuditLogs(auditData ?? []);
      setStatus("ready");
    } catch (exception) {
      setError(exception.message);
      setStatus("ready");
    }
  }

  function handleLogout() {
    clearAuthSession();
    window.location.href = "/login";
  }

  async function handleCreateTrainer(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsCreatingTrainer(true);

    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;

    try {
      await apiRequest("/api/admin/trainers", {
        method: "POST",
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          username: formData.get("trainerUsername"),
          email: formData.get("email"),
          password: formData.get("trainerInitialPassword"),
          roleTitle: formData.get("roleTitle"),
          description: formData.get("description"),
          plans: [
            {
              sessions: Number(formData.get("sessionsOne")),
              price: Number(formData.get("priceOne")),
              focus: formData.get("focusOne"),
            },
            {
              sessions: Number(formData.get("sessionsTwo")),
              price: Number(formData.get("priceTwo")),
              focus: formData.get("focusTwo"),
            },
            {
              sessions: Number(formData.get("sessionsThree")),
              price: Number(formData.get("priceThree")),
              focus: formData.get("focusThree"),
            },
          ],
        }),
      });
      form.reset();
      setSuccess("Antrenorul a fost creat si poate intra in aplicatie.");
      await loadAdminDashboard();
    } catch (exception) {
      setError(exception.message);
    } finally {
      setIsCreatingTrainer(false);
    }
  }

  async function executeUserStatusChange(userItem, active) {
    setError("");
    setSuccess("");

    try {
      await apiRequest(`/api/admin/users/${userItem.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
      setSuccess(active ? "Contul a fost activat." : "Contul a fost dezactivat.");
      await loadAdminDashboard();
    } catch (exception) {
      setError(exception.message);
    }
  }

  function handleToggleUser(userItem) {
    if (userItem.active) {
      setPendingAdminAction({ type: "deactivate", user: userItem });
      setConfirmationInput("");
      return;
    }

    executeUserStatusChange(userItem, true);
  }

  async function executeDeleteUser(userItem) {
    setError("");
    setSuccess("");

    try {
      await apiRequest(`/api/admin/users/${userItem.id}`, {
        method: "DELETE",
      });
      setSuccess("Contul a fost sters definitiv.");
      await loadAdminDashboard();
    } catch (exception) {
      setError(exception.message);
    }
  }

  function handleDeleteUser(userItem) {
    setPendingAdminAction({ type: "delete", user: userItem });
    setConfirmationInput("");
  }

  function closeAdminActionModal() {
    if (isAdminActionSubmitting) {
      return;
    }

    setPendingAdminAction(null);
    setConfirmationInput("");
  }

  async function confirmAdminAction() {
    if (!pendingAdminAction) {
      return;
    }

    setIsAdminActionSubmitting(true);

    try {
      if (pendingAdminAction.type === "deactivate") {
        await executeUserStatusChange(pendingAdminAction.user, false);
      } else {
        await executeDeleteUser(pendingAdminAction.user);
      }

      setPendingAdminAction(null);
      setConfirmationInput("");
    } finally {
      setIsAdminActionSubmitting(false);
    }
  }

  async function handlePaymentDateSubmit(event) {
    event.preventDefault();
    await loadAdminDashboard(untilDate);
  }

  const pendingActionIsDelete = pendingAdminAction?.type === "delete";
  const pendingActionUser = pendingAdminAction?.user;
  const canConfirmPendingAction =
    pendingAdminAction &&
    !isAdminActionSubmitting &&
    (!pendingActionIsDelete || confirmationInput.trim() === pendingActionUser.username);
  const selectedChat =
    chats.find((conversation) => conversation.id === selectedChatId) ?? chats[0] ?? null;

  return (
    <main className="dashboard-shell">
      <nav className="topbar auth-topbar" aria-label="Navigatie super-admin">
        <a className="brand" href="/super-admin-dashboard">
          <TetFitLogo />
          <span>TET-FIT</span>
        </a>
        <div className="nav-links">
          <a className="nav-action" href="/antrenori">
            Planuri publice
          </a>
          <button className="nav-action nav-action-strong" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>

      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Super-admin</p>
          <h1>{user ? `Salut, ${user.fullName}` : "Administrare platforma"}</h1>
          <p className="dashboard-copy">
            Gestioneaza antrenorii, conturile, istoricul de chat si veniturile
            inregistrate din planurile alese de clienti.
          </p>
        </div>
      </section>

      <section className="trainer-workspace admin-workspace" aria-label="Dashboard super-admin">
        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="form-success">{success}</p> : null}
        {status === "loading" ? <p className="exercise-state">Se incarca administrarea...</p> : null}

        <article className="progress-monitor">
          <span className="feature-index">Platforma</span>
          <h2>Indicatori principali</h2>
          <div className="admin-stat-grid">
            <div>
              <span>Utilizatori</span>
              <strong>{summary?.totalUsers ?? 0}</strong>
            </div>
            <div>
              <span>Conturi active</span>
              <strong>{summary?.activeUsers ?? 0}</strong>
            </div>
            <div>
              <span>Antrenori</span>
              <strong>{summary?.trainers ?? 0}</strong>
            </div>
            <div>
              <span>Venit total</span>
              <strong>{summary?.totalRevenue ?? 0} RON</strong>
            </div>
          </div>
        </article>

        <article className="progress-monitor">
          <span className="feature-index">Antrenori</span>
          <h2>Adauga antrenor</h2>
          <form className="admin-form" onSubmit={handleCreateTrainer} autoComplete="off">
            <div className="form-grid">
              <label className="field">
                <span>Nume complet</span>
                <input name="fullName" autoComplete="off" required />
              </label>
              <label className="field">
                <span>Username</span>
                <input name="trainerUsername" autoComplete="off" minLength="3" required />
              </label>
              <label className="field">
                <span>Email</span>
                <input type="email" name="email" autoComplete="off" required />
              </label>
              <label className="field">
                <span>Parola initiala</span>
                <input
                  type="password"
                  name="trainerInitialPassword"
                  autoComplete="new-password"
                  minLength="8"
                  required
                />
              </label>
              <label className="field">
                <span>Rol public</span>
                <input name="roleTitle" autoComplete="off" placeholder="ex: Antrenor personal" required />
              </label>
              <label className="field">
                <span>Descriere</span>
                <input name="description" autoComplete="off" placeholder="Specializare si abordare" required />
              </label>
            </div>
            <div className="admin-plan-grid">
              <div>
                <strong>Pachet 1</strong>
                <label className="field">
                  <span>Sedinte</span>
                  <input type="number" name="sessionsOne" defaultValue="3" min="1" required />
                </label>
                <label className="field">
                  <span>Pret</span>
                  <input type="number" name="priceOne" defaultValue="300" min="1" required />
                </label>
                <label className="field">
                  <span>Focus</span>
                  <input name="focusOne" defaultValue="Forta si tehnica de baza" required />
                </label>
              </div>
              <div>
                <strong>Pachet 2</strong>
                <label className="field">
                  <span>Sedinte</span>
                  <input type="number" name="sessionsTwo" defaultValue="4" min="1" required />
                </label>
                <label className="field">
                  <span>Pret</span>
                  <input type="number" name="priceTwo" defaultValue="350" min="1" required />
                </label>
                <label className="field">
                  <span>Focus</span>
                  <input name="focusTwo" defaultValue="Hipertrofie si recompozitie" required />
                </label>
              </div>
              <div>
                <strong>Pachet 3</strong>
                <label className="field">
                  <span>Sedinte</span>
                  <input type="number" name="sessionsThree" defaultValue="5" min="1" required />
                </label>
                <label className="field">
                  <span>Pret</span>
                  <input type="number" name="priceThree" defaultValue="450" min="1" required />
                </label>
                <label className="field">
                  <span>Focus</span>
                  <input name="focusThree" defaultValue="Performanta, forta si conditionare" required />
                </label>
              </div>
            </div>
            <button className="primary-button login-submit" type="submit" disabled={isCreatingTrainer}>
              {isCreatingTrainer ? "Se creeaza..." : "Creeaza antrenor"}
            </button>
          </form>
        </article>

        <article className="progress-monitor">
          <span className="feature-index">Conturi</span>
          <h2>Utilizatori</h2>
          <div className="admin-table">
            {users.map((item) => (
              <div className="admin-row" key={item.id}>
                <div>
                  <strong>{item.fullName}</strong>
                  <span>{item.username} - {item.email}</span>
                </div>
                <span className={`admin-status ${item.active ? "admin-status-active" : ""}`}>
                  {item.active ? "Activ" : "Dezactivat"}
                </span>
                <span>{item.role}</span>
                <div className="button-row">
                  <button className="text-button" type="button" onClick={() => handleToggleUser(item)}>
                    {item.active ? "Dezactiveaza" : "Activeaza"}
                  </button>
                  <button className="text-button danger-button" type="button" onClick={() => handleDeleteUser(item)}>
                    Sterge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="progress-monitor">
          <span className="feature-index">Plati</span>
          <h2>Istoric financiar</h2>
          <form className="admin-filter-form" onSubmit={handlePaymentDateSubmit}>
            <label className="field">
              <span>Pana la data</span>
              <input
                type="date"
                value={untilDate}
                onChange={(event) => setUntilDate(event.target.value)}
              />
            </label>
            <button className="text-button" type="submit">
              Filtreaza
            </button>
          </form>
          <div className="selected-plan">
            <p>Total pana la {payments?.until ?? untilDate}: <strong>{payments?.totalRevenue ?? 0} RON</strong></p>
          </div>
          <div className="admin-revenue-section">
            <strong>Venit per antrenor</strong>
            <div className="admin-trainer-revenue-grid">
              {(payments?.trainerRevenues ?? []).map((trainer) => (
                <div key={trainer.trainerName}>
                  <span>{trainer.trainerName}</span>
                  <strong>{trainer.totalRevenue} RON</strong>
                  <small>{trainer.paymentsCount} plati inregistrate</small>
                </div>
              ))}
              {payments?.trainerRevenues?.length ? null : (
                <p>Nu exista venituri in intervalul selectat.</p>
              )}
            </div>
          </div>
          <h3 className="admin-subtitle">Plati individuale</h3>
          <div className="admin-table compact-admin-table">
            {(payments?.payments ?? []).map((payment) => (
              <div className="admin-row" key={payment.id}>
                <div>
                  <strong>{payment.clientName}</strong>
                  <span>{payment.trainerName} - {payment.sessions} sedinte / saptamana</span>
                </div>
                <span>{payment.amount} RON</span>
                <span>{new Date(payment.paidAt).toLocaleDateString("ro-RO")}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="progress-monitor">
          <span className="feature-index">Audit comunicare</span>
          <h2>Istoric chat client-antrenor</h2>
          <p className="admin-section-note">
            Conversatiile sunt separate pe perechi client-antrenor, ca super-adminul sa poata
            verifica rapid contextul fara sa amestece mesajele.
          </p>
          <div className="admin-chat-workspace">
            <div className="admin-conversation-list" aria-label="Conversatii client-antrenor">
              {chats.map((conversation) => (
                <button
                  className={`admin-conversation-item ${
                    selectedChat?.id === conversation.id ? "admin-conversation-active" : ""
                  }`}
                  key={conversation.id}
                  type="button"
                  onClick={() => setSelectedChatId(conversation.id)}
                >
                  <span>Client</span>
                  <strong>{conversation.clientName}</strong>
                  <em>Antrenor: {conversation.trainerName}</em>
                  <small>
                    {conversation.messageCount} mesaje -{" "}
                    {new Date(conversation.lastMessageAt).toLocaleString("ro-RO")}
                  </small>
                  <p>{conversation.latestMessage}</p>
                </button>
              ))}
              {!chats.length ? (
                <p className="admin-empty-state">Nu exista conversatii inca.</p>
              ) : null}
            </div>

            <div className="admin-chat-detail">
              {selectedChat ? (
                <>
                  <div className="admin-chat-detail-header">
                    <div>
                      <span className="feature-index">Conversatie</span>
                      <h3>{selectedChat.clientName}</h3>
                      <p>Antrenor: {selectedChat.trainerName}</p>
                    </div>
                    <strong>{selectedChat.messageCount} mesaje</strong>
                  </div>
                  <div className="admin-chat-messages" aria-label="Mesaje conversatie">
                    {selectedChat.messages.map((message) => (
                      <div
                        className={`chat-message ${
                          message.senderRole === "TRAINER" ? "chat-message-own" : ""
                        }`}
                        key={message.id}
                      >
                        <strong>{message.senderName}</strong>
                        <p>{message.text}</p>
                        <span>
                          {message.senderRole} -{" "}
                          {new Date(message.createdAt).toLocaleString("ro-RO")}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="admin-empty-state">Nu exista conversatii inca.</p>
              )}
            </div>
          </div>
        </article>

        <article className="progress-monitor">
          <span className="feature-index">Audit administrativ</span>
          <h2>Actiuni super-admin</h2>
          <div className="admin-audit-list">
            {auditLogs.map((log) => (
              <div className="admin-audit-item" key={log.id}>
                <span className={`admin-audit-action admin-audit-${log.action?.toLowerCase()}`}>
                  {getAdminActionLabel(log.action)}
                </span>
                <div>
                  <strong>{log.targetName ?? "Cont sters"}</strong>
                  <p>{log.details}</p>
                  <small>
                    {log.actorName} ({log.actorUsername}) -{" "}
                    {new Date(log.createdAt).toLocaleString("ro-RO")}
                  </small>
                </div>
                <span>{log.targetRole ?? "N/A"}</span>
              </div>
            ))}
            {!auditLogs.length ? <p>Nu exista actiuni administrative inregistrate.</p> : null}
          </div>
        </article>
      </section>
      {pendingAdminAction ? (
        <div className="admin-modal-backdrop" role="presentation">
          <div
            className="admin-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
          >
            <span className="feature-index">
              {pendingActionIsDelete ? "Confirmare stergere" : "Confirmare dezactivare"}
            </span>
            <h2 id="admin-confirm-title">
              {pendingActionIsDelete ? "Stergi definitiv contul?" : "Dezactivezi contul?"}
            </h2>
            <div className="admin-confirm-target">
              <strong>{pendingActionUser.fullName}</strong>
              <span>{pendingActionUser.username} - {pendingActionUser.email}</span>
              <small>{pendingActionUser.role}</small>
            </div>
            {pendingActionIsDelete ? (
              <>
                <p className="admin-danger-note">
                  Actiunea sterge definitiv contul si datele operationale dependente. Nu este
                  echivalenta cu dezactivarea.
                </p>
                <label className="field">
                  <span>Scrie username-ul pentru reconfirmare</span>
                  <input
                    value={confirmationInput}
                    onChange={(event) => setConfirmationInput(event.target.value)}
                    placeholder={pendingActionUser.username}
                    autoFocus
                  />
                </label>
              </>
            ) : (
              <p className="admin-warning-note">
                Contul ramane in sistem, dar utilizatorul nu va mai putea intra in aplicatie pana
                cand il reactivezi.
              </p>
            )}
            <div className="admin-modal-actions">
              <button className="text-button" type="button" onClick={closeAdminActionModal}>
                Renunta
              </button>
              <button
                className={`text-button ${pendingActionIsDelete ? "danger-button" : ""}`}
                type="button"
                onClick={confirmAdminAction}
                disabled={!canConfirmPendingAction}
              >
                {isAdminActionSubmitting
                  ? "Se aplica..."
                  : pendingActionIsDelete
                    ? "Sterge definitiv"
                    : "Dezactiveaza contul"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function TrainersPage() {
  const session = getStoredAuth();
  const user = session?.user;
  const role = user ? getUserRole(user) : null;
  const [trainers, setTrainers] = React.useState([]);
  const [currentPlan, setCurrentPlan] = React.useState(null);
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let isMounted = true;

    async function loadTrainers() {
      setStatus("loading");
      setError("");

      try {
        const trainersData = await apiRequest("/api/trainers");
        const plan = user && role === "CLIENT" ? await apiRequest("/api/client/plan") : null;

        if (!isMounted) {
          return;
        }

        setTrainers(trainersData ?? []);
        setCurrentPlan(plan);
        setStatus("ready");
      } catch (exception) {
        if (!isMounted) {
          return;
        }

        setError(exception.message);
        setStatus("ready");
      }
    }

    loadTrainers();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handlePlanSelection(plan) {
    if (!user) {
      savePendingPlan(plan.id);
      window.location.href = "/register";
      return;
    }

    if (role === "TRAINER") {
      window.location.href = "/antrenor-dashboard";
      return;
    }

    if (currentPlan) {
      window.location.href = "/dashboard";
      return;
    }

    await apiRequest("/api/client/plan", {
      method: "POST",
      body: JSON.stringify({ planId: plan.id }),
    });
    window.location.href = "/dashboard";
  }

  return (
    <main className="trainers-shell">
      <nav className="topbar auth-topbar" aria-label="Navigatie antrenori">
        <a className="brand" href={getHomeHref(user)}>
          <TetFitLogo />
          <span>TET-FIT</span>
        </a>
        <div className="nav-links">
          <ClientNotificationsButton />
          <a className="nav-action" href={getHomeHref(user)}>
            {user ? "Dashboard" : "Acasa"}
          </a>
          {user ? (
            <a className="nav-action nav-action-strong" href={getRoleDashboardPath(user)}>
              Dashboard
            </a>
          ) : (
            <a className="nav-action nav-action-strong" href="/login">
              Log in
            </a>
          )}
        </div>
      </nav>

      <section className="trainers-hero">
        <div>
          <p className="eyebrow">Antrenori TET-FIT</p>
          <h1>Vezi antrenorii TET-FIT</h1>
          <p className="trainers-copy">
            Compara specializarile, descrierile si pachetele lunare disponibile,
            apoi continua cu planul care se potriveste obiectivului tau.
          </p>
        </div>
      </section>

      <section className="trainer-list" aria-label="Lista antrenori">
        {error ? <p className="form-error">{error}</p> : null}
        {status === "loading" ? <p className="exercise-state">Se incarca planurile...</p> : null}
        {trainers.map((trainer) => {
          const trainerMedia = getTrainerMedia(trainer.name);

          return (
            <article className="trainer-card" key={trainer.name}>
              <div className="trainer-profile">
                {trainerMedia?.image ? (
                  <img
                    className="trainer-photo"
                    src={trainerMedia.image}
                    alt={`Portret ${trainer.name}`}
                  />
                ) : (
                  <div className="trainer-avatar" aria-hidden="true">
                    {getTrainerInitials(trainer.name)}
                  </div>
                )}
                <div>
                  <span className="trainer-role">{trainer.role}</span>
                  <h2>{trainer.name}</h2>
                  <p>{trainerMedia?.shortDescription ?? trainer.description}</p>
                  {trainerMedia?.tags ? (
                    <div className="trainer-tags" aria-label={`Specializari ${trainer.name}`}>
                      {trainerMedia.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="pricing-grid" aria-label={`Tarife ${trainer.name}`}>
                {trainer.plans.map((plan) => (
                  <div className="pricing-option" key={plan.sessions}>
                    <span>{plan.sessions} sedinte / saptamana</span>
                    <strong>{plan.price} RON</strong>
                    <small>pe luna</small>
                    <p>{plan.focus}</p>
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => handlePlanSelection(plan)}
                      disabled={Boolean(currentPlan)}
                    >
                      {currentPlan ? "Plan deja activ" : "Alege pachetul"}
                    </button>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function LoginPage() {
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const session = await submitAuthRequest("/login", {
        username: formData.get("username"),
        password: formData.get("password"),
      });

      saveAuthSession(session);
      await attachPendingPlanToAccount(session.user);
      redirectToDashboard(session);
    } catch (exception) {
      setError(exception.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <nav className="topbar auth-topbar" aria-label="Navigatie autentificare">
        <a className="brand" href="/">
          <TetFitLogo />
          <span>TET-FIT</span>
        </a>
        <a className="nav-action" href="/">
          Acasa
        </a>
      </nav>

      <section className="auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">Zona ta de progres</p>
          <h1>Log in</h1>
          <p>
            Intra in cont pentru a-ti vedea dashboard-ul, antrenamentele si
            evolutia personala.
          </p>
        </div>

        <form className="login-card" aria-label="Formular log in" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>Autentificare</h2>
            <p>Foloseste username-ul si parola contului tau TET-FIT.</p>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <label className="field">
            <span>Username</span>
            <input type="text" name="username" autoComplete="username" required />
          </label>

          <label className="field">
            <span>Parola</span>
            <div className="password-field">
              <input
                type={isPasswordVisible ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                required
              />
              <button
                className="password-reveal-button"
                type="button"
                aria-label="Tine apasat pentru a vedea parola"
                title="Tine apasat pentru a vedea parola"
                onPointerDown={() => setIsPasswordVisible(true)}
                onPointerUp={() => setIsPasswordVisible(false)}
                onPointerLeave={() => setIsPasswordVisible(false)}
                onPointerCancel={() => setIsPasswordVisible(false)}
                onBlur={() => setIsPasswordVisible(false)}
                onKeyDown={(event) => {
                  if (event.key === " " || event.key === "Enter") {
                    setIsPasswordVisible(true);
                  }
                }}
                onKeyUp={() => setIsPasswordVisible(false)}
              >
                Aa
              </button>
            </div>
          </label>

          <button className="primary-button login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Se autentifica..." : "Log in"}
          </button>

          <div className="auth-actions">
            <a href="/register" className="text-button">
              Creeaza cont nou
            </a>
            <a href="/forgot-password" className="text-button">
              Am uitat parola
            </a>
          </div>
        </form>
      </section>
    </main>
  );
}

function RegisterPage() {
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("Parolele nu coincid.");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await submitAuthRequest("/register", {
        fullName: formData.get("fullName"),
        username: formData.get("username"),
        email: formData.get("email"),
        password,
      });

      saveAuthSession(session);
      await attachPendingPlanToAccount(session.user);
      redirectToDashboard(session);
    } catch (exception) {
      setError(exception.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <nav className="topbar auth-topbar" aria-label="Navigatie creare cont">
        <a className="brand" href="/">
          <TetFitLogo />
          <span>TET-FIT</span>
        </a>
        <a className="nav-action" href="/login">
          Log in
        </a>
      </nav>

      <section className="auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">Incepe antrenamentul digital</p>
          <h1>Cont nou</h1>
          <p>
            Creeaza-ti profilul TET-FIT pentru a salva antrenamente, obiective
            si progresul tau de la o sesiune la alta.
          </p>
        </div>

        <form className="login-card" aria-label="Formular creare cont" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>Creeaza cont</h2>
            <p>Completeaza datele de baza pentru noul tau profil.</p>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <label className="field">
            <span>Nume complet</span>
            <input type="text" name="fullName" autoComplete="name" required />
          </label>

          <label className="field">
            <span>Username</span>
            <input type="text" name="username" autoComplete="username" minLength="3" required />
          </label>

          <label className="field">
            <span>Email</span>
            <input type="email" name="email" autoComplete="email" required />
          </label>

          <label className="field">
            <span>Parola</span>
            <input type="password" name="password" autoComplete="new-password" minLength="8" required />
          </label>

          <label className="field">
            <span>Confirma parola</span>
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              minLength="8"
              required
            />
          </label>

          <button className="primary-button login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Se creeaza contul..." : "Creeaza cont"}
          </button>

          <div className="auth-actions">
            <a href="/login" className="text-button">
              Am deja cont
            </a>
          </div>
        </form>
      </section>
    </main>
  );
}

function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await submitAuthRequest("/forgot-password", {
        email,
      });
      setSuccess("Ti-am trimis o parola temporara pe email.");
      setEmail("");
    } catch (exception) {
      setError(exception.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <nav className="topbar auth-topbar" aria-label="Navigatie resetare parola">
        <a className="brand" href="/">
          <TetFitLogo />
          <span>TET-FIT</span>
        </a>
        <a className="nav-action" href="/login">
          Log in
        </a>
      </nav>

      <section className="auth-layout">
        <div className="auth-copy">
          <p className="eyebrow">Recuperare acces</p>
          <h1>Resetare parola</h1>
          <p>
            Introdu emailul contului tau si iti trimitem o parola temporara
            generata automat.
          </p>
        </div>

        <form className="login-card compact-card" aria-label="Formular resetare parola" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>Am uitat parola</h2>
            <p>Vom folosi emailul pentru a identifica profilul tau.</p>
          </div>

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <button className="primary-button login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Se trimite..." : "Trimite parola temporara"}
          </button>

          <div className="auth-actions">
            <a href="/login" className="text-button">
              Inapoi la log in
            </a>
            <a href="/register" className="text-button">
              Creeaza cont nou
            </a>
          </div>
        </form>
      </section>
    </main>
  );
}

function RoleRedirect({ session }) {
  React.useEffect(() => {
    window.location.replace(getRoleDashboardPath(session.user));
  }, [session]);

  return (
    <main className="auth-shell">
      <p className="exercise-state">Se deschide dashboard-ul...</p>
    </main>
  );
}

function App() {
  const session = getStoredAuth();
  const role = getUserRole(session?.user);

  const routes = {
    "/dashboard": session ? (
      role === "SUPER_ADMIN" ? (
        <SuperAdminDashboardPage />
      ) : role === "CLIENT" ? (
        <DashboardPage />
      ) : (
        <TrainerDashboardPage />
      )
    ) : (
      <LoginPage />
    ),
    "/antrenor-dashboard": session ? (
      role === "TRAINER" ? <TrainerDashboardPage /> : <RoleRedirect session={session} />
    ) : (
      <LoginPage />
    ),
    "/antrenor-client": session ? (
      role === "TRAINER" ? <TrainerClientPage /> : <RoleRedirect session={session} />
    ) : (
      <LoginPage />
    ),
    "/antrenor-client-istoric": session ? (
      role === "TRAINER" ? <TrainerClientHistoryPage /> : <RoleRedirect session={session} />
    ) : (
      <LoginPage />
    ),
    "/super-admin-dashboard": session ? (
      role === "SUPER_ADMIN" ? <SuperAdminDashboardPage /> : <RoleRedirect session={session} />
    ) : (
      <LoginPage />
    ),
    "/datele-mele": session ? (
      role === "CLIENT" ? <ClientProfilePage /> : <RoleRedirect session={session} />
    ) : (
      <LoginPage />
    ),
    "/plan-activ": session ? (
      role === "CLIENT" ? <ActivePlanPage /> : <RoleRedirect session={session} />
    ) : (
      <LoginPage />
    ),
    "/exercitii": session ? <ExercisesPage /> : <LoginPage />,
    "/antrenori": <TrainersPage />,
    "/login": session ? <RoleRedirect session={session} /> : <LoginPage />,
    "/register": session ? <RoleRedirect session={session} /> : <RegisterPage />,
    "/forgot-password": session ? <RoleRedirect session={session} /> : <ForgotPasswordPage />,
  };

  return routes[window.location.pathname] ?? <LandingPage />;
}

createRoot(document.getElementById("root")).render(<App />);
