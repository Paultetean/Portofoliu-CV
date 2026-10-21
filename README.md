# TET-FIT - Platforma web pentru managementul antrenamentelor personale

TET-FIT este o aplicatie web dezvoltata pentru o platforma de fitness in care clientii pot alege un antrenor, pot urmari antrenamentele primite, isi pot inregistra progresul si nutritia, iar antrenorii pot administra clientii, programarile, exercitiile, recomandarile nutritionale si comunicarea directa cu fiecare client.

Acest README este scris ca baza de documentatie pentru lucrarea de licenta. Documentul prezinta arhitectura, modul de rulare, functionalitatile pe roluri, fluxurile principale si deciziile tehnice implementate in proiect.

## Cuprins

1. [Scopul aplicatiei](#scopul-aplicatiei)
2. [Stadiul proiectului](#stadiul-proiectului)
3. [Arhitectura generala](#arhitectura-generala)
4. [Tehnologii folosite](#tehnologii-folosite)
5. [Structura proiectului](#structura-proiectului)
6. [Pornirea aplicatiei](#pornirea-aplicatiei)
7. [Configurare environment](#configurare-environment)
8. [Conturi demo create automat](#conturi-demo-create-automat)
9. [Roluri si drepturi](#roluri-si-drepturi)
10. [Functionalitati generale](#functionalitati-generale)
11. [Functionalitati client](#functionalitati-client)
12. [Functionalitati antrenor](#functionalitati-antrenor)
13. [Functionalitati super-admin](#functionalitati-super-admin)
14. [Managementul exercitiilor si integrarea ExerciseDB](#managementul-exercitiilor-si-integrarea-exercisedb)
15. [Modulul de nutritie](#modulul-de-nutritie)
16. [Generatorul de antrenamente asistat de model ML](#generatorul-de-antrenamente-asistat-de-model-ml)
17. [Modelul de date](#modelul-de-date)
18. [API endpoints](#api-endpoints)
19. [Scenariu demo recomandat](#scenariu-demo-recomandat)
20. [Testare si verificare](#testare-si-verificare)
21. [Limitari curente si directii viitoare](#limitari-curente-si-directii-viitoare)

## Scopul aplicatiei

Aplicatia rezolva o problema practica intalnita in colaborarea dintre antrenorii personali si clientii lor: informatia este adesea impartita intre chat-uri, fisiere, agende, aplicatii de notite si tabele separate. TET-FIT centralizeaza aceste activitati intr-o platforma unica.

Obiectivele principale sunt:

- gestionarea conturilor de client, antrenor si administrator;
- alegerea unui antrenor si a unui plan de sedinte;
- programarea sedintelor pe baza disponibilitatii antrenorului;
- atribuirea de exercitii clientilor;
- vizualizarea exercitiilor impreuna cu imagini/GIF-uri demonstrative;
- completarea rezultatelor reale de catre client: repetari si greutati pe fiecare serie;
- monitorizarea progresului pe baza datelor completate;
- gestionarea nutritiei: calorii, proteine, carbohidrati, grasimi si greutate corporala;
- generarea unei sugestii nutritionale in functie de datele clientului;
- comunicare client-antrenor prin chat;
- administrare platforma prin cont de super-admin;
- suport pentru generarea asistata a antrenamentelor folosind un model ML simplu, antrenat local.

## Stadiul proiectului

Aplicatia este functionala ca prototip complet pentru prezentare. Functionalitatile principale sunt implementate in:

- `frontend/` - interfata React;
- `auth-service/` - backend Spring Boot care contine autentificarea, rolurile, dashboard-urile, training-ul, nutritia, exercitiile, chat-ul si administrarea;
- `docker-compose.yml` - infrastructura locala: Traefik, PostgreSQL si serviciul backend.

Folderele `user-service/` si `workout-service/` exista in structura proiectului ca directie arhitecturala initiala pentru microservicii separate, dar in versiunea curenta logica operationala este consolidata in `auth-service`. Aceasta decizie simplifica rularea demo si reduce complexitatea operationala in faza de licenta.

## Arhitectura generala

Aplicatia este construita ca sistem web client-server.

```text
Browser
  |
  | React + Vite
  v
Frontend local: http://localhost:5173
  |
  | HTTP/JSON + JWT Bearer Token
  v
Auth service: http://localhost:8081
  |
  | JPA/Hibernate
  v
PostgreSQL: auth_db
```

In Docker Compose exista si Traefik:

```text
Traefik
  - http://localhost
  - dashboard: http://localhost:8080
```

Backend-ul poate fi apelat direct pe `http://localhost:8081` sau prin Traefik pe rutele care incep cu `/api`.

### Separarea responsabilitatilor

- Frontend-ul se ocupa de randarea paginilor, managementul sesiunii in `localStorage`, formulare, grafice SVG si interactiuni.
- Backend-ul se ocupa de reguli de business, validari, persistenta, autentificare, autorizare pe roluri si integrarea cu API-uri externe.
- PostgreSQL pastreaza datele aplicatiei.
- Docker Compose porneste infrastructura necesara pentru rularea locala.
- Scriptul ML din `ml/` genereaza modelul folosit pentru sugestii de antrenament.

## Tehnologii folosite

### Frontend

- React 19;
- Vite;
- JavaScript/JSX;
- CSS custom;
- Playwright instalat local in `node_modules`, folosit pentru verificari UI in timpul dezvoltarii;
- assets locale pentru logo, landing page si imagini antrenori.

### Backend

- Java 21;
- Spring Boot 3.3.5;
- Spring Web;
- Spring Data JPA;
- Hibernate;
- PostgreSQL driver;
- Spring Validation;
- Spring Security Crypto pentru hash parola;
- JJWT pentru token-uri JWT;
- Spring Boot Actuator pentru health check;
- Spring Mail pentru resetarea parolei prin email.

### Infrastructura

- Docker;
- Docker Compose;
- PostgreSQL 16;
- Traefik 2.10;
- Maven.

### Machine Learning

- Python;
- model KNN custom, serializat in JSON;
- dataset generat local din profiluri, prompturi si catalog ExerciseDB.

## Structura proiectului

```text
tet-fit/
  auth-service/
    Dockerfile
    pom.xml
    src/main/java/com/fitness/auth/
      admin/       # super-admin, utilizatori, plati, audit, conversatii
      api/         # auth endpoints: register, login, forgot-password
      config/      # seed data, configurari beans
      exercise/    # integrare ExerciseDB si catalog exercitii
      security/    # JWT si utilizator curent
      service/     # AuthService, PasswordResetMailService
      training/    # client, antrenor, planuri, programari, nutritie, chat
      user/        # AppUser, roluri, repository
    src/main/resources/
      application.yml
      workout_model.json
  frontend/
    package.json
    src/
      app/main.jsx
      styles/main.css
      assets/
        tet-fit-logo.png
        landing-hero.png
        trainer-paul.png
        trainer-catalina.png
  ml/
    train_workout_model.py
    workout_training_dataset.json
  user-service/
  workout-service/
  docker-compose.yml
  .env
  .gitignore
  README.md
```

## Pornirea aplicatiei

### Cerinte

Pentru rulare locala sunt necesare:

- Docker Desktop pornit;
- Node.js 20+;
- npm;
- Java 21 si Maven, doar daca se ruleaza backend-ul in afara Docker;
- conexiune la internet pentru ExerciseDB si pentru trimiterea emailurilor prin SMTP.

### 1. Pornirea containerelor Docker

Din folderul radacina:

```powershell
cd C:\Users\pault\Desktop\Licenta\tet-fit
docker compose up -d
```

Comanda porneste:

- `fitness-traefik`;
- `fitness-auth-db`;
- `fitness-user-db`;
- `fitness-workout-db`;
- `fitness-auth-service`.

### 2. Verificarea backend-ului

```powershell
Invoke-RestMethod http://localhost:8081/actuator/health
```

Raspuns asteptat:

```json
{
  "status": "UP"
}
```

### 3. Pornirea frontend-ului

Intr-un terminal separat:

```powershell
cd C:\Users\pault\Desktop\Licenta\tet-fit\frontend
npm install
npm run dev
```

Aplicatia se deschide la:

```text
http://localhost:5173
```

### 4. Build frontend pentru productie

```powershell
cd C:\Users\pault\Desktop\Licenta\tet-fit\frontend
npm run build
```

Output-ul este generat in:

```text
frontend/dist/
```

### 5. Oprirea containerelor

```powershell
docker compose down
```

Pentru stergerea volumelor si a datelor locale:

```powershell
docker compose down -v
```

Atentie: `docker compose down -v` sterge bazele de date locale.

## Configurare environment

Aplicatia citeste variabilele din `.env`, incarcat automat de Docker Compose.

Variabile importante:

```text
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<email_aplicatie>
MAIL_PASSWORD=<app_password>
MAIL_FROM=<email_aplicatie>
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS_ENABLE=true
MAIL_HEALTH_ENABLED=false
EXERCISEDB_RAPIDAPI_KEY=<optional_pentru_proxy_imagini>
```

### Email pentru resetarea parolei

Functionalitatea "Am uitat parola" foloseste SMTP:

1. utilizatorul introduce emailul;
2. backend-ul cauta utilizatorul dupa email;
3. daca exista si este activ, backend-ul genereaza o parola temporara;
4. parola temporara este trimisa prin email;
5. parola din baza de date este inlocuita cu hash-ul parolei temporare.

Pentru Gmail este necesar un App Password, nu parola obisnuita a contului.

### ExerciseDB RapidAPI Key

Catalogul de exercitii este preluat din endpointul public OSS:

```text
https://oss.exercisedb.dev/api/v1/exercises
```

Pentru proxy-ul de imagine prin RapidAPI se foloseste variabila:

```text
EXERCISEDB_RAPIDAPI_KEY
```

Daca aceasta lipseste, frontend-ul poate folosi `gifUrl` original din catalog, iar backend-ul returneaza `404` pentru ruta de proxy imagine.

## Conturi demo create automat

La pornirea backend-ului, `SeedDataConfig` creeaza automat conturi demo daca acestea nu exista.

| Rol | Username | Parola | Observatii |
| --- | --- | --- | --- |
| Super admin | `super.admin` | `Admin123!` | Administrare platforma |
| Antrenor | `paul.trainer` | `Trainer123!` | Paul Tetean |
| Antrenor | `catalina.trainer` | `Trainer123!` | Catalina Buzan |

Antrenorii primesc automat profil public si pachete tarifare.

Paul Tetean:

- 3 sedinte/saptamana, 300 RON, "Forta si tehnica de baza";
- 4 sedinte/saptamana, 350 RON, "Hipertrofie si recompozitie corporala";
- 5 sedinte/saptamana, 450 RON, "Performanta, forta si conditionare".

Catalina Buzan:

- 3 sedinte/saptamana, 300 RON, "Tonifiere si slabire progresiva";
- 4 sedinte/saptamana, 350 RON, "Recompozitie si mobilitate";
- 5 sedinte/saptamana, 450 RON, "Program intensiv cu monitorizare".

## Roluri si drepturi

Aplicatia foloseste roluri stocate in `UserRole`:

```text
USER
CLIENT
TRAINER
SUPER_ADMIN
```

Rolul principal pentru conturile create prin formularul public este `CLIENT`.

### CLIENT

Clientul poate:

- crea cont;
- intra in dashboard-ul personal;
- completa datele personale;
- alege un antrenor si un plan;
- vedea planul activ;
- rezerva sloturi disponibile;
- vedea exercitiile atribuite;
- completa rezultatele exercitiilor;
- loga nutritia zilnica;
- vizualiza grafice de nutritie si progres;
- comunica prin chat cu antrenorul;
- consulta catalogul de exercitii.

### TRAINER

Antrenorul poate:

- vedea clientii care i-au ales planurile;
- deschide disponibilitate in calendar;
- crea programari pentru clienti;
- vedea rezultatele completate de clienti;
- atribui exercitii;
- genera sugestii de antrenament;
- ajusta planul activ al clientului;
- calcula sugestii nutritionale;
- seta targeturi nutritionale;
- consulta istoricul clientului;
- comunica prin chat cu fiecare client.

### SUPER_ADMIN

Super-adminul poate:

- vedea sumarul platformei;
- vedea lista utilizatorilor;
- crea antrenori noi;
- activa/dezactiva conturi;
- sterge conturi;
- vedea conversatiile grupate pe client-antrenor;
- vedea istoricul platilor simulate;
- vedea jurnalul de audit.

## Functionalitati generale

### Landing page

Landing page-ul este prima zona vizibila pentru utilizatorii neautentificati.

Include:

- logo TET-FIT;
- mesaj de prezentare;
- butoane pentru creare cont, descoperirea aplicatiei si lista de antrenori;
- prezentarea modulelor aplicatiei;
- lista de antrenori cu imagini, descrieri scurte si taguri;
- acces rapid la autentificare.

Pentru utilizatorii autentificati, call-to-action-urile se schimba in functie de rol:

- clientul vede linkuri catre plan activ, calendar si profil;
- antrenorul vede linkuri catre clienti si exercitii;
- super-adminul vede link catre administrare.

### Autentificare

Fluxul de autentificare este format din:

1. register;
2. login;
3. stocarea tokenului JWT in `localStorage`;
4. redirectionare catre dashboard-ul rolului;
5. trimiterea tokenului in headerul `Authorization`.

Endpointuri:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
```

### Register

Formularul de creare cont cere:

- nume complet;
- username;
- email;
- parola;
- confirmare parola.

Validari:

- username minim 3 caractere;
- parola minim 8 caractere;
- email valid;
- username unic;
- email unic;
- parola si confirmarea parolei trebuie sa coincida.

### Login

Formularul de login cere:

- username;
- parola.

Exista un buton in caseta parolei care permite afisarea temporara a parolei cat timp utilizatorul tine apasat.

### Resetare parola

Pagina "Am uitat parola" cere emailul contului. Daca emailul exista, sistemul trimite o parola temporara pe mail.

Flux:

1. utilizatorul introduce emailul;
2. frontend-ul trimite `POST /api/auth/forgot-password`;
3. backend-ul cauta utilizatorul dupa email;
4. se genereaza o parola temporara de 12 caractere;
5. se trimite email prin SMTP;
6. parola temporara este salvata in baza de date ca hash;
7. utilizatorul se poate autentifica folosind username-ul si parola primita.

## Functionalitati client

### 1. Crearea contului

Clientul incepe din landing page si acceseaza "Creeaza cont". Dupa completarea formularului, contul este creat cu rol `CLIENT`, iar clientul este autentificat automat.

### 2. Completarea profilului personal

Pagina:

```text
/datele-mele
```

Date gestionate:

- varsta;
- inaltime;
- greutate curenta;
- greutate tinta;
- data tinta;
- sex;
- stil de viata;
- nivel de experienta;
- obiectiv;
- zile disponibile pe saptamana;
- durata maxima a unei sedinte;
- restrictii sau accidentari.

Aceste date sunt importante pentru:

- sugestia nutritionala;
- generarea antrenamentelor;
- interpretarea progresului;
- personalizarea planului.

Validari:

- greutatea tinta trebuie sa fie pozitiva;
- data tinta nu poate fi in trecut.

### 3. Alegerea antrenorului

Pagina:

```text
/antrenori
```

Clientul poate vedea:

- lista de antrenori;
- fotografia fiecarui antrenor;
- descrierea scurta;
- specializarile;
- pachetele disponibile;
- pretul lunar;
- numarul de sedinte pe saptamana.

Dupa alegerea unui plan:

1. frontend-ul trimite `POST /api/client/plan`;
2. backend-ul verifica daca utilizatorul are deja un plan activ;
3. se creeaza `ClientPlan`;
4. clientul este directionat catre dashboard.

Clientul nu poate selecta mai multe planuri simultan.

### 4. Dashboard client

Pagina:

```text
/dashboard
```

Dashboard-ul clientului centralizeaza:

- sumar plan activ;
- notificari;
- exercitii atribuite;
- calendar;
- rezervari;
- nutritie;
- chat;
- istoric de progres.

Datele sunt incarcate din mai multe endpointuri:

```text
GET /api/client/plan
GET /api/client/profile
GET /api/client/assigned-exercises
GET /api/client/workout-logs
GET /api/client/appointments
GET /api/client/availability
GET /api/client/nutrition-target
GET /api/client/nutrition-logs
GET /api/client/chat
```

### 5. Notificari client

Clientul primeste notificari in UI pentru:

- plan activ;
- mesaje noi de la antrenor;
- exercitii atribuite;
- programari;
- informatii care cer atentie.

Notificarile pot fi marcate ca vazute local.

### 6. Exercitii atribuite

Clientul vede exercitiile primite de la antrenor:

- numele exercitiului;
- ziua de antrenament;
- data programata;
- grupe musculare;
- numar de serii;
- interval de repetari;
- greutate sugerata;
- note de executie;
- imagine/GIF demonstrativ.

Clientul poate completa rezultatele reale:

- repetari pe fiecare serie;
- greutate folosita pe fiecare serie.

Validare backend:

- numarul de valori completate pentru repetari trebuie sa fie egal cu numarul de serii;
- numarul de valori completate pentru greutati trebuie sa fie egal cu numarul de serii.

Endpoint:

```text
PATCH /api/client/assigned-exercises/{assignmentId}/results
```

### 7. Calendar si rezervari

Clientul poate vedea sloturile disponibile deschise de antrenorul sau.

Reguli:

- clientul poate rezerva doar sloturi de 60 minute;
- sloturile din trecut nu pot fi rezervate;
- daca un client rezerva un slot nou in aceeasi zi, rezervarea anterioara din acea zi este eliberata;
- clientul vede atat sloturile disponibile, cat si programarile sale.

Endpointuri:

```text
GET /api/client/availability
POST /api/client/availability/{slotId}/book
GET /api/client/appointments
POST /api/client/appointments
```

### 8. Plan activ

Pagina:

```text
/plan-activ
```

Clientul vede:

- antrenorul ales;
- numarul de sedinte;
- pretul;
- focusul planului;
- notele antrenorului;
- data selectarii;
- data ultimei actualizari.

### 9. Nutritie client

Clientul poate loga zilnic:

- calorii;
- proteine;
- carbohidrati;
- grasimi;
- greutate corporala optionala;
- note.

Reguli:

- nu se poate loga nutritia pentru zile viitoare;
- valorile nutritionale nu pot fi negative;
- greutatea, daca este completata, trebuie sa fie pozitiva;
- pentru aceeasi zi se face update, nu duplicare.

Endpointuri:

```text
GET /api/client/nutrition-target
GET /api/client/nutrition-logs
POST /api/client/nutrition-logs
```

### 10. Grafice nutritie

Dashboard-ul clientului permite consultarea evolutiei pe zile pentru:

- calorii;
- proteine;
- carbohidrati;
- grasimi;
- greutate.

Graficele folosesc logurile zilnice si targetul setat de antrenor.

### 11. Chat client-antrenor

Clientul poate trimite mesaje catre antrenorul din planul activ.

Endpointuri:

```text
GET /api/client/chat
POST /api/client/chat
```

Mesajele sunt stocate cu:

- expeditor;
- rol expeditor;
- text;
- data crearii;
- client;
- profil antrenor.

## Functionalitati antrenor

### 1. Dashboard antrenor

Pagina:

```text
/antrenor-dashboard
```

Dashboard-ul antrenorului include:

- salut personalizat;
- calendar de lucru;
- panou de disponibilitate;
- lista clientilor activi;
- sumar pe client;
- statusul exercitiilor pentru data selectata;
- acces rapid la pagina detaliata a clientului.

Endpointuri principale:

```text
GET /api/trainer/clients
GET /api/trainer/appointments
GET /api/trainer/availability
POST /api/trainer/availability
```

### 2. Clientii antrenorului

Lista de clienti este construita din planurile active asociate profilului antrenorului.

Pentru fiecare client, antrenorul vede:

- nume;
- email;
- plan ales;
- focus;
- notele antrenorului;
- exercitii atribuite;
- rezultate completate;
- programari;
- mesaje;
- profil client;
- target nutritional;
- loguri nutritionale.

### 3. Disponibilitate antrenor

Antrenorul poate deschide intervale disponibile.

Reguli backend:

- un interval trebuie sa fie intre 60 si 480 minute;
- durata trebuie sa fie divizibila in sloturi de 60 minute;
- intervalele din trecut sunt respinse;
- fiecare interval este impartit in sloturi de 60 minute;
- sloturile deja existente nu se dubleaza.

Exemplu:

```text
Antrenorul creeaza disponibilitate 16:00 - 19:00.
Backend-ul creeaza 3 sloturi:
  16:00 - 17:00
  17:00 - 18:00
  18:00 - 19:00
```

Endpoint:

```text
POST /api/trainer/availability
```

### 4. Programari create de antrenor

Antrenorul poate crea o programare direct pentru un client.

Endpoint:

```text
POST /api/trainer/appointments
```

Programarea contine:

- client;
- data si ora;
- durata;
- titlu;
- note.

### 5. Pagina detaliata a clientului

Pagina:

```text
/antrenor-client?clientId=<id>
```

Include:

- sumar client;
- antrenamentul zilei selectate;
- progres fata de prima valoare;
- grafic pe exercitii completate;
- nutritie;
- exercitii atribuite;
- formular de atribuire exercitii;
- generator de sugestii;
- chat.

### 6. Actualizarea planului clientului

Antrenorul poate actualiza:

- focusul planului;
- notele pentru client.

Endpoint:

```text
PATCH /api/trainer/clients/{clientId}/plan
```

### 7. Atribuirea exercitiilor

Antrenorul poate cauta un exercitiu si il poate atribui clientului.

Date completate:

- `exerciseId`;
- nume exercitiu;
- GIF/imagine;
- ziua de antrenament;
- data programata;
- grupe musculare;
- numar de serii;
- repetari minime;
- repetari maxime;
- greutate sugerata;
- note.

Endpoint:

```text
POST /api/trainer/clients/{clientId}/assigned-exercises
```

Antrenorul poate edita sau sterge exercitii atribuite:

```text
PATCH /api/trainer/assigned-exercises/{assignmentId}
DELETE /api/trainer/assigned-exercises/{assignmentId}
```

### 8. Sugestii de antrenament

Antrenorul poate genera un antrenament sugerat pentru un client.

Endpoint:

```text
POST /api/trainer/clients/{clientId}/workout-suggestions
```

Input:

- data antrenamentului;
- prompt optional.

Output:

- titlu;
- rationale;
- lista de exercitii sugerate;
- serii;
- repetari;
- grupe musculare;
- note.

### 9. Monitorizarea progresului

Antrenorul vede rezultatele completate de client:

- repetari;
- greutati;
- exercitii efectuate;
- evolutie pe zile;
- progres pe exercitii;
- PR-uri;
- istoric.

Logica UI grupeaza datele pe data programata si permite vizualizarea antrenamentelor completate.

### 10. Istoric client

Pagina:

```text
/antrenor-client-istoric?clientId=<id>
```

Include:

- antrenamente completate;
- exercitii efectuate;
- loguri nutritionale;
- greutate;
- calorii;
- macronutrienti;
- sumar al ultimei inregistrari.

Aceasta pagina separa istoricul de pagina operationala a clientului, pentru ca dashboard-ul antrenorului sa ramana orientat spre actiunile curente.

### 11. Nutritie pentru client

Antrenorul poate:

- vedea profilul nutritional al clientului;
- cere sugestie nutritionala;
- seta target de calorii si macronutrienti;
- vedea logurile clientului;
- vedea graficele de evolutie.

Endpointuri:

```text
GET /api/trainer/clients/{clientId}/nutrition-suggestion
PATCH /api/trainer/clients/{clientId}/nutrition-target
```

### 12. Chat antrenor-client

Fiecare conversatie este legata de perechea client-antrenor.

Endpoint:

```text
POST /api/trainer/clients/{clientId}/chat
```

## Functionalitati super-admin

### 1. Dashboard super-admin

Pagina:

```text
/super-admin-dashboard
```

Dashboard-ul include:

- sumar utilizatori;
- utilizatori activi;
- numar clienti;
- numar antrenori;
- utilizatori inactivi;
- venit total simulat;
- formular creare antrenor;
- lista utilizatorilor;
- conversatii;
- plati;
- audit log.

Endpointuri:

```text
GET /api/admin/summary
GET /api/admin/users
POST /api/admin/trainers
PATCH /api/admin/users/{userId}/status
DELETE /api/admin/users/{userId}
GET /api/admin/chats
GET /api/admin/payments
GET /api/admin/audit-logs
```

### 2. Crearea antrenorilor

Super-adminul poate crea conturi de antrenor.

Campuri:

- nume complet;
- username;
- email;
- parola initiala;
- rol public;
- descriere;
- pachete tarifare.

Daca nu sunt trimise pachete tarifare, backend-ul creeaza implicit:

- 3 sedinte, 300 RON;
- 4 sedinte, 350 RON;
- 5 sedinte, 450 RON.

Actiunea este salvata in audit log.

### 3. Activare si dezactivare conturi

Super-adminul poate activa sau dezactiva utilizatori.

Regula:

- super-adminul nu isi poate dezactiva propriul cont.

Actiunile sunt salvate in audit log.

### 4. Stergere conturi

Super-adminul poate sterge conturi.

Reguli:

- nu isi poate sterge propriul cont;
- la stergerea unui client se sterg datele dependente: chat, exercitii, programari, loguri, nutritie, profil, plan;
- sloturile rezervate de client sunt eliberate;
- la stergerea unui antrenor se sterg profilul, planurile, disponibilitatile, exercitiile, programarile, targeturile nutritionale si conversatiile aferente.

### 5. Conversatii grupate

Conversatiile nu sunt afisate ca un chat global amestecat. Ele sunt grupate pe pereche:

```text
clientId:trainerProfileId
```

Pentru fiecare conversatie se afiseaza:

- client;
- antrenor;
- numar mesaje;
- ultimul mesaj;
- data ultimului mesaj;
- lista mesajelor.

### 6. Plati simulate

Istoricul platilor este construit din planurile alese de clienti.

Pentru fiecare `ClientPlan` se considera:

- client;
- antrenor;
- numar sedinte;
- suma;
- focus;
- data alegerii planului.

Super-adminul poate vedea:

- total incasari;
- incasari pe antrenor;
- lista platilor.

### 7. Audit log

Auditul retine ultimele actiuni administrative:

- `CREATE_TRAINER`;
- `ACTIVATE_ACCOUNT`;
- `DEACTIVATE_ACCOUNT`;
- `DELETE_ACCOUNT`.

Pentru fiecare actiune se salveaza:

- adminul care a facut actiunea;
- utilizatorul tinta;
- rolul utilizatorului tinta;
- detalii;
- data crearii.

## Managementul exercitiilor si integrarea ExerciseDB

Aplicatia foloseste un catalog de exercitii pentru cautare si atribuire.

Endpointuri:

```text
GET /api/exercises
GET /api/exercises/{exerciseId}/image
GET /api/exercises/debug
POST /api/exercises/refresh
```

### Incarcarea catalogului

Backend-ul foloseste:

```text
https://oss.exercisedb.dev/api/v1/exercises
```

Logica:

1. daca exista exercitii in baza de date, se folosesc acelea;
2. daca baza de date este goala, backend-ul descarca paginat catalogul;
3. exercitiile sunt salvate local;
4. raspunsul este cache-uit in memorie 6 ore;
5. endpointul `/refresh` forteaza redescarcarea si rescrierea catalogului.

### Imagini si GIF-uri

Fiecare exercitiu poate avea `gifUrl`. Frontend-ul foloseste imaginea/GIF-ul pentru ca antrenorul si clientul sa vada executia miscarii.

Pentru proxy imagine, backend-ul foloseste RapidAPI:

```text
https://exercisedb.p.rapidapi.com/image
```

Raspunsul imaginii este cache-uit public 30 zile.

### Beneficiu in aplicatie

Integrarea ExerciseDB permite:

- cautare dupa exercitii reale;
- afisarea executiei vizuale;
- atribuirea exercitiilor cu informatii despre grupe musculare;
- folosirea catalogului in generatorul de antrenamente.

## Modulul de nutritie

Modulul de nutritie este impartit in doua zone:

- clientul logheaza aportul zilnic;
- antrenorul calculeaza si seteaza targetul recomandat.

### Date necesare pentru sugestie

Clientul trebuie sa completeze:

- varsta;
- inaltime;
- greutate;
- sex;
- stil de viata;
- obiectiv.

Daca lipseste oricare dintre acestea, backend-ul returneaza eroare si cere completarea datelor in "Datele mele".

### Formula BMI

```text
BMI = greutate_kg / (inaltime_m * inaltime_m)
```

### Formula BMR

Se foloseste formula Mifflin-St Jeor.

Pentru barbati:

```text
BMR = 10 * greutate_kg + 6.25 * inaltime_cm - 5 * varsta + 5
```

Pentru femei:

```text
BMR = 10 * greutate_kg + 6.25 * inaltime_cm - 5 * varsta - 161
```

### Formula TDEE

```text
TDEE = BMR * factor_activitate
```

Factori folositi:

| Stil de viata | Factor |
| --- | ---: |
| Sedentar | 1.2 |
| Usor activ | 1.375 |
| Moderat | 1.55 |
| Intens / activ | 1.725 |

### Ajustare dupa obiectiv

| Obiectiv | Calcul |
| --- | --- |
| Slabire | TDEE - 300 pana la TDEE - 500 |
| Mentinere | TDEE |
| Masa | TDEE + 250 pana la TDEE + 400 |

Aplicatia foloseste o valoare centrala:

- slabire: `TDEE - 400`;
- masa: `TDEE + 325`;
- mentinere: `TDEE`.

### Macronutrienti

Proteine:

```text
1.6 - 2.2 g / kg corp
```

Valoare centrala folosita:

```text
1.9 g / kg corp
```

Grasimi:

```text
0.7 - 1.0 g / kg corp
```

Valoare centrala folosita:

```text
0.85 g / kg corp
```

Carbohidrati:

```text
carbs = (calorii - proteine * 4 - grasimi * 9) / 4
```

### Greutate tinta

Clientul poate completa:

- greutate tinta;
- data tinta.

Backend-ul calculeaza:

- diferenta fata de greutatea curenta;
- schimbare estimata pe saptamana;
- nota despre ritm: conservator, realist sau agresiv.

Aceasta functionalitate ajuta antrenorul sa evalueze daca obiectivul este realist.

## Generatorul de antrenamente asistat de model ML

Aplicatia include un generator de sugestii pentru antrenor.

Fisier principal:

```text
ml/train_workout_model.py
```

Output:

```text
auth-service/src/main/resources/workout_model.json
ml/workout_training_dataset.json
```

### Rolul modelului

Modelul nu inlocuieste antrenorul. El propune o structura initiala pe care antrenorul o poate ajusta.

Modelul prezice:

- grupe musculare tinta;
- termeni prioritari;
- tipuri de echipamente preferate;
- exercitii de evitat;
- numar de exercitii;
- numar de serii;
- interval de repetari.

### Date folosite

Scriptul construieste datasetul din:

- profiluri sintetice de clienti;
- obiective: forta, masa musculara, slabire, conditionare;
- niveluri: incepator, intermediar, avansat;
- restrictii: genunchi, umar, zona lombara;
- prompturi de antrenor;
- preferinte de echipament;
- termeni extrasi din catalogul ExerciseDB, daca backend-ul este pornit.

### Feature vector

Modelul transforma fiecare exemplu in vector numeric.

Exemple de feature-uri:

- varsta;
- BMI;
- sex;
- nivel experienta;
- obiectiv;
- restrictii;
- focus push/pull/legs/core;
- preferinta dumbbell/barbell/cable/machine;
- exercitii de evitat;
- durata sedintei;
- focus explicit pe grupe musculare.

### Inferenta in backend

Backend-ul incarca:

```text
/workout_model.json
```

Daca modelul exista si are `modelType = knn-v1`, se foloseste KNN.

Daca modelul lipseste sau nu poate fi citit, backend-ul foloseste fallback bazat pe reguli:

- infera grupe musculare din text;
- infera prioritati din prompt;
- evita exercitii restrictionate;
- selecteaza exercitii din catalog.

### Selectia exercitiilor

Sugestia finala:

1. construieste contextul din plan, note, obiectiv si prompt;
2. prezice structura antrenamentului;
3. filtreaza exercitiile dupa grupe musculare;
4. elimina exercitiile restrictionate;
5. aplica termeni de evitare;
6. sorteaza dupa scor;
7. selecteaza o lista echilibrata;
8. returneaza exercitii cu serii, repetari si note.

## Modelul de date

Principalele entitati persistate:

### AppUser

Reprezinta utilizatorul aplicatiei.

Campuri importante:

- id;
- fullName;
- username;
- email;
- passwordHash;
- role;
- active;
- createdAt.

### TrainerProfile

Profil public pentru antrenor.

Campuri:

- user;
- displayName;
- roleTitle;
- description.

### TrainingPlan

Pachet tarifar al unui antrenor.

Campuri:

- trainerProfile;
- sessions;
- price;
- focus.

### ClientPlan

Planul activ ales de client.

Campuri:

- client;
- trainingPlan;
- activeFocus;
- trainerNotes;
- selectedAt;
- updatedAt.

### ClientProfile

Datele personale si sportive ale clientului.

Campuri:

- age;
- height;
- weight;
- targetWeight;
- targetDate;
- sex;
- lifestyle;
- experienceLevel;
- goal;
- daysPerWeek;
- maxSessionDuration;
- restrictions.

### AssignedExercise

Exercitiu atribuit unui client.

Campuri:

- client;
- trainerProfile;
- exerciseId;
- exerciseName;
- gifUrl;
- dayName;
- scheduledDate;
- muscleGroups;
- setsCount;
- minReps;
- maxReps;
- suggestedWeight;
- notes;
- repsPerSet;
- weightsPerSet.

### TrainerAvailabilitySlot

Slot de disponibilitate al antrenorului.

Campuri:

- trainerProfile;
- client optional;
- scheduledAt;
- durationMinutes;
- title;
- notes.

### TrainingAppointment

Programare creata explicit.

Campuri:

- client;
- trainerProfile;
- scheduledAt;
- durationMinutes;
- title;
- notes.

### ChatMessage

Mesaj intre client si antrenor.

Campuri:

- client;
- trainerProfile;
- sender;
- senderRole;
- text;
- createdAt.

### NutritionTarget

Target nutritional setat de antrenor.

Campuri:

- client;
- trainerProfile;
- calories;
- protein;
- carbs;
- fats;
- notes;
- updatedAt.

### DailyNutritionLog

Log nutritional zilnic completat de client.

Campuri:

- client;
- logDate;
- calories;
- protein;
- carbs;
- fats;
- weight;
- notes;
- createdAt;
- updatedAt.

### WorkoutLog

Jurnal de antrenament general.

Campuri:

- client;
- date;
- workoutType;
- duration;
- progress;
- workoutPlan;
- attachmentName;
- createdAt.

### AdminAuditLog

Audit pentru actiunile super-adminului.

Campuri:

- actor;
- target;
- action;
- details;
- createdAt.

## API endpoints

### Auth

| Metoda | Ruta | Descriere |
| --- | --- | --- |
| POST | `/api/auth/register` | Creeaza cont client |
| POST | `/api/auth/login` | Autentifica utilizator |
| POST | `/api/auth/forgot-password` | Trimite parola temporara prin email |

### Public

| Metoda | Ruta | Descriere |
| --- | --- | --- |
| GET | `/api/trainers` | Lista antrenorilor si planurilor |
| GET | `/api/exercises` | Catalog exercitii |
| GET | `/api/exercises/{exerciseId}/image` | Imagine/GIF exercitiu prin proxy |
| GET | `/api/exercises/debug` | Debug prima pagina ExerciseDB |
| POST | `/api/exercises/refresh` | Reincarca exercitiile |

### Client

| Metoda | Ruta | Descriere |
| --- | --- | --- |
| GET | `/api/client/profile` | Profil client |
| PATCH | `/api/client/profile` | Actualizare profil client |
| GET | `/api/client/plan` | Plan activ |
| POST | `/api/client/plan` | Alegere plan |
| GET | `/api/client/workout-logs` | Jurnale antrenament |
| POST | `/api/client/workout-logs` | Creeaza jurnal antrenament |
| GET | `/api/client/assigned-exercises` | Exercitii atribuite |
| PATCH | `/api/client/assigned-exercises/{assignmentId}/results` | Completeaza rezultate |
| GET | `/api/client/nutrition-target` | Target nutritie |
| GET | `/api/client/nutrition-logs` | Loguri nutritie |
| POST | `/api/client/nutrition-logs` | Creeaza/update log nutritie |
| GET | `/api/client/chat` | Mesaje client |
| POST | `/api/client/chat` | Trimite mesaj |
| GET | `/api/client/appointments` | Programari client |
| POST | `/api/client/appointments` | Solicita programare |
| GET | `/api/client/availability` | Sloturi disponibile |
| POST | `/api/client/availability/{slotId}/book` | Rezerva slot |

### Trainer

| Metoda | Ruta | Descriere |
| --- | --- | --- |
| GET | `/api/trainer/clients` | Clientii antrenorului |
| GET | `/api/trainer/appointments` | Programari antrenor |
| GET | `/api/trainer/availability` | Disponibilitate antrenor |
| POST | `/api/trainer/availability` | Creeaza sloturi disponibile |
| POST | `/api/trainer/appointments` | Creeaza programare |
| PATCH | `/api/trainer/clients/{clientId}/plan` | Actualizeaza plan client |
| POST | `/api/trainer/clients/{clientId}/chat` | Trimite mesaj clientului |
| POST | `/api/trainer/clients/{clientId}/workout-suggestions` | Genereaza sugestie antrenament |
| GET | `/api/trainer/clients/{clientId}/nutrition-suggestion` | Calculeaza sugestie nutritie |
| PATCH | `/api/trainer/clients/{clientId}/nutrition-target` | Seteaza target nutritie |
| POST | `/api/trainer/clients/{clientId}/assigned-exercises` | Atribuie exercitiu |
| PATCH | `/api/trainer/assigned-exercises/{assignmentId}` | Editeaza exercitiu atribuit |
| DELETE | `/api/trainer/assigned-exercises/{assignmentId}` | Sterge exercitiu atribuit |

### Super-admin

| Metoda | Ruta | Descriere |
| --- | --- | --- |
| GET | `/api/admin/summary` | Sumar platforma |
| GET | `/api/admin/users` | Lista utilizatori |
| POST | `/api/admin/trainers` | Creeaza antrenor |
| PATCH | `/api/admin/users/{userId}/status` | Activeaza/dezactiveaza cont |
| DELETE | `/api/admin/users/{userId}` | Sterge cont |
| GET | `/api/admin/chats` | Conversatii grupate |
| GET | `/api/admin/payments` | Istoric plati |
| GET | `/api/admin/audit-logs` | Audit log |

## Scenariu demo recomandat

Acest scenariu poate fi folosit pentru prezentarea lucrarii de licenta.

### Pasul 1: Pornirea platformei

1. Se porneste Docker Compose.
2. Se porneste frontend-ul Vite.
3. Se verifica `http://localhost:5173`.
4. Se verifica backend-ul cu actuator health.

### Pasul 2: Prezentarea landing page-ului

1. Se arata logo-ul si mesajul platformei.
2. Se arata modulele principale.
3. Se acceseaza "Vezi antrenori".
4. Se prezinta antrenorii si pachetele.

### Pasul 3: Creare cont client

1. Se creeaza un cont client.
2. Se completeaza Datele mele.
3. Se adauga greutate curenta, greutate tinta si obiectiv.
4. Se alege un antrenor si un plan.

### Pasul 4: Dashboard client

1. Se arata planul activ.
2. Se arata calendarul.
3. Se arata exercitiile atribuite.
4. Se completeaza rezultate pentru un exercitiu.
5. Se completeaza nutritia pe o zi.
6. Se trimite mesaj catre antrenor.

### Pasul 5: Dashboard antrenor

1. Login cu `paul.trainer`.
2. Se vede lista clientilor.
3. Se deschide disponibilitate in calendar.
4. Se intra pe pagina clientului.
5. Se atribuie exercitii.
6. Se genereaza o sugestie de antrenament.
7. Se calculeaza target nutritional.
8. Se trimite mesaj clientului.
9. Se acceseaza istoricul clientului.

### Pasul 6: Super-admin

1. Login cu `super.admin`.
2. Se verifica sumarul platformei.
3. Se creeaza un antrenor nou.
4. Se dezactiveaza/reactiveaza un cont de test.
5. Se verifica conversatiile grupate.
6. Se verifica platile simulate.
7. Se verifica audit log-ul.

### Pasul 7: Resetare parola

1. Se acceseaza "Am uitat parola".
2. Se introduce emailul unui cont existent.
3. Aplicatia trimite parola temporara prin email.
4. Utilizatorul se autentifica folosind parola primita.

## Testare si verificare

### Backend tests

Exista test pentru register si login:

```powershell
cd C:\Users\pault\Desktop\Licenta\tet-fit\auth-service
mvn test
```

Testul foloseste profilul `test` si baza H2.

### Frontend build

```powershell
cd C:\Users\pault\Desktop\Licenta\tet-fit\frontend
npm run build
```

### Health check backend

```powershell
Invoke-RestMethod http://localhost:8081/actuator/health
```

### Test rapid login

```powershell
$body = @{
  username = "super.admin"
  password = "Admin123!"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:8081/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Test resetare parola

```powershell
$body = @{
  email = "adresa-unui-cont-existent@example.com"
} | ConvertTo-Json

Invoke-WebRequest `
  -Uri "http://localhost:8081/api/auth/forgot-password" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

Raspuns asteptat la succes:

```text
204 No Content
```

## Limitari curente si directii viitoare

### Limitari curente

- aplicatia este gandita ca prototip local pentru licenta, nu ca deployment productie;
- `JWT_SECRET` are valoare de dezvoltare in Docker Compose;
- nu exista refresh token;
- nu exista schimbare parola din cont dupa login;
- plata este simulata din alegerea planului, nu integrata cu un procesator real;
- `user-service` si `workout-service` sunt pregatite ca structura, dar nu au implementare separata;
- uploadul de fisiere reale pentru atasamente nu este implementat;
- modelul ML este un KNN custom, nu un model antrenat cu framework dedicat;
- frontend-ul este o aplicatie React single page fara router extern, rutarea fiind gestionata in `main.jsx`;
- nu exista sistem complet de permisiuni granulare in afara rolurilor principale.

### Directii viitoare

- separarea domeniilor in microservicii reale: auth, users, workout, nutrition;
- refresh token si expirare controlata a sesiunii;
- schimbare parola din cont;
- integrare plati reale;
- notificari email pentru programari;
- upload de fisiere pentru progres;
- dashboard-uri analitice mai avansate;
- export PDF pentru progresul clientului;
- sistem de abonamente;
- teste end-to-end automate;
- migrarea bazei cu Flyway sau Liquibase;
- deploy cloud cu pipeline CI/CD.

## Observatii pentru lucrarea de licenta

Pentru documentatia academica, proiectul poate fi prezentat in urmatoarele capitole:

1. analiza problemei: comunicarea fragmentata dintre client si antrenor;
2. cerinte functionale si nefunctionale;
3. arhitectura aplicatiei;
4. modelul de date;
5. implementarea backend;
6. implementarea frontend;
7. integrarea cu servicii externe;
8. modulul de nutritie si formulele folosite;
9. modulul ML pentru sugestii de antrenament;
10. scenariu de testare si validare;
11. concluzii si dezvoltari viitoare.

Aplicatia demonstreaza un flux complet client-antrenor-admin si poate fi folosita ca prototip realist pentru o platforma profesionala de coaching fitness.
