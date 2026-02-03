# NestJS Students API - Learning Project

A progressive NestJS learning project building a Students REST API, evolving from in-memory storage to a full database-backed application.

---

# Day 01 - Students API (In-Memory)

Simple REST API built with NestJS to practice:
- Modules, Controllers, Services
- Dependency Injection (DI)
- DTOs + ValidationPipe (class-validator)
- Model binding (route params, query params, body)
- In-memory storage (no database)
- UUID id validation (ParseUUIDPipe)

> Note: Data is stored in memory, so it resets on server restart.

---

## Tech Stack (Day 01)
- NestJS
- TypeScript
- class-validator + class-transformer
- Node.js `crypto.randomUUID()` (UUID v4)

---

## Setup & Run (Day 01)

From this folder (`students-api/`):

```bash
npm install
npm run start:dev
```

Base URL:
- `http://localhost:3000/api`

---

## Endpoints (Day 01)

### 1) Get All Students
`GET /api/students/all`

### 2) Get Student By Id (UUID v4)
`GET /api/students/:id`

> `:id` must be a valid UUID v4, otherwise you get `400 Bad Request`.

### 3) Create Student
`POST /api/students`

Example body:
```json
{
  "name": "Ali",
  "age": 20,
  "grade": 75,
  "isActive": true
}
```

### 4) Update Student (Partial Update)
`PUT /api/students/:id`

Example body:
```json
{
  "age": 45
}
```

### 5) Delete Student
`DELETE /api/students/:id`

### 6) Get Passed Students
`GET /api/students/passed?minGrade=60`

- `minGrade` optional (default: 50)

### 7) Get Average Grade
`GET /api/students/averagegrade`

---

## Validation Rules (DTOs)
- `name`: string, min length 2
- `age`: integer between 6 and 80
- `grade`: integer between 0 and 100
- `isActive`: boolean

Validation is enabled globally using `ValidationPipe` in `src/main.ts`.

---

## Project Structure (Day 01)

```
src/
  main.ts                  # app bootstrap + global prefix + ValidationPipe
  app.module.ts            # imports StudentsModule
  students/
    students.module.ts     # module definition
    students.controller.ts # endpoints (routes)
    students.service.ts    # in-memory business logic
    dto/
      create-student.dto.ts
      update-student.dto.ts
    entities/
      student.entity.ts    # Student shape (id is UUID string)
    seed/
      students.seed.ts     # initial 10 students (seed data)
```

---

## Postman (Day 01)

Bu projedeki tüm endpoint'ler Postman Collection olarak hazırlanmıştır.

### Files
- Collection: `postman/Day01 - Students API.postman_collection.json`
- Environment: `postman/Local - Day01 Students API.postman_environment.json`

### Import & Run
1) Postman → **Import** → yukarıdaki collection dosyasını seç
2) (Opsiyonel) Environment dosyasını da import et ve **Local - Day01 Students API** environment'ını seç
3) Server'ı çalıştır:
   ```bash
   npm run start:dev
   ```
4) İstekleri çalıştır

---

## Notes (Day 01)
- This project uses in-memory array storage (`StudentsService`), no DB.
- Seed data is loaded on app start.
- UUID validation is implemented via `ParseUUIDPipe({ version: '4' })`.

---
---

# Day 02 - Students API (TypeORM + PostgreSQL)

REST API built with NestJS, TypeORM, and PostgreSQL:

- Modules, Controllers, Services
- DTOs + ValidationPipe (class-validator)
- TypeORM with PostgreSQL persistence
- UUID v4 validation (ParseUUIDPipe)
- Safe database seed (runs once, no duplicates)

---

## Tech Stack (Day 02)

- NestJS
- TypeScript
- TypeORM + PostgreSQL (pg)
- class-validator + class-transformer
- @nestjs/config (environment variables)

---

## 1) Install dependencies

From `students-api/`:

```bash
npm install
```

If you see peer dependency conflicts (e.g. with NestJS 11), use:

```bash
npm install --legacy-peer-deps
```

This installs (among others):

- `@nestjs/typeorm`, `typeorm`, `pg`
- `@nestjs/config`
- `dotenv`

---

## 2) PostgreSQL setup

- Install PostgreSQL and ensure it is running.
- Create the database:

```sql
CREATE DATABASE students_db;
```

(Or with `psql`: `psql -U postgres -c "CREATE DATABASE students_db;"`)

---

## 3) Environment

Copy `.env.example` to `.env` (or use the existing `.env`) and set:

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `PORT` (optional, default 3000)

Example:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=2004
DB_NAME=students_db
PORT=3000
```

---

## 4) Run migrations

Build and run the initial migration to create the `students` table:

```bash
npm run build
npm run migration:run
```

To generate a new migration after changing entities:

```bash
npm run migration:generate
```

Then run it:

```bash
npm run migration:run
```

---

## 5) Start the server

```bash
npm run start:dev
```

Base URL: `http://localhost:3000/api`

On first start, the seed runs once (if the table is empty) and inserts 10 students.

---

## Endpoints (Day 02)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/students` | All students |
| GET | `/api/students/all` | All students (same as above) |
| GET | `/api/students/:id` | Student by UUID v4 |
| POST | `/api/students` | Create student |
| PUT | `/api/students/:id` | Partial update |
| DELETE | `/api/students/:id` | Delete student |
| GET | `/api/students/passed?minGrade=60` | Students with grade ≥ minGrade (default 50) |
| GET | `/api/students/averagegrade` | `{ "average": number }` |

---

## Verification checklist (Day 02)

- [ ] `npm install` completes without errors.
- [ ] PostgreSQL is running and `students_db` exists.
- [ ] `.env` has correct DB credentials and PORT.
- [ ] `npm run build` succeeds.
- [ ] `npm run migration:run` runs and creates the `students` table.
- [ ] `npm run start:dev` starts and logs no DB connection errors.
- [ ] GET `/api/students` or GET `/api/students/all` returns an array (10 items after seed).
- [ ] GET `/api/students/3b1d8c6a-8c3a-4a3f-9b0c-7e3d2c5c8f11` returns one student.
- [ ] POST `/api/students` with valid body creates a student and returns it with `id` and `createdAt`.
- [ ] PUT `/api/students/:id` with partial body updates and returns the student.
- [ ] DELETE `/api/students/:id` returns `{ "deleted": true }`; GET same `:id` then returns 404.
- [ ] GET `/api/students/passed?minGrade=60` returns only students with grade ≥ 60.
- [ ] GET `/api/students/averagegrade` returns `{ "average": number }`.
- [ ] Invalid UUID in GET/PUT/DELETE `:id` returns 400.
- [ ] Non-existent `:id` returns 404.

---

## Postman (Day 02)

- Collection: `postman/Day01 - Students API.postman_collection.json`
- Environment: `postman/Local - Day01 Students API.postman_environment.json`

Use base URL `http://localhost:3000` (with prefix `/api` in the paths). Both `/api/students` and `/api/students/all` work for "Get All Students".

---

## Project structure (Day 02)

```
src/
  main.ts
  app.module.ts           # ConfigModule, TypeOrmModule.forRoot
  data-source.ts          # TypeORM DataSource for CLI migrations
  migrations/
    *.ts                  # TypeORM migrations
  students/
    students.module.ts    # TypeOrmModule.forFeature([StudentEntity])
    students.controller.ts
    students.service.ts   # Repository-based
    students-seed.service.ts  # Safe seed on bootstrap
    entities/
      student.entity.ts   # TypeORM entity
    dto/
      create-student.dto.ts
      update-student.dto.ts
    seed.ts               # Seed data (10 students)
```
